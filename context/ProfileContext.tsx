'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConditionId, UserProfile } from '@/types/health';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

interface ProfileContextType {
  user: UserProfile;
  activeConditions: ConditionId[];
  toggleCondition: (conditionId: ConditionId) => void;
  setConditions: (conditions: ConditionId[]) => void;
  applyPresetProfile: (preset: 'diabetic' | 'hypertensive' | 'lactose' | 'gout' | 'gluten' | 'healthy') => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-user-1',
  email: 'guest@igotyou.health',
  full_name: 'Health Explorer',
  conditions: ['diabetes_type_2', 'hypertension'],
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'igotyou_user_conditions_v1';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeConditions, setActiveConditionsState] = useState<ConditionId[]>(
    DEFAULT_PROFILE.conditions
  );
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Load initial state from LocalStorage or Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setActiveConditionsState(parsed);
          setUser((prev) => ({ ...prev, conditions: parsed }));
        }
      }
    } catch (e) {
      console.error('Failed to load local profile state:', e);
    }
  }, []);

  const saveConditions = (newConditions: ConditionId[]) => {
    setActiveConditionsState(newConditions);
    setUser((prev) => ({ ...prev, conditions: newConditions }));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConditions));
    } catch (e) {
      console.error('Failed to persist profile state:', e);
    }

    if (isSupabaseConfigured && supabase && user.id !== 'guest-user-1') {
      supabase
        .from('profiles')
        .update({ conditions: newConditions })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.warn('Failed to sync conditions to Supabase:', error);
        });
    }
  };

  const toggleCondition = (conditionId: ConditionId) => {
    const updated = activeConditions.includes(conditionId)
      ? activeConditions.filter((c) => c !== conditionId)
      : [...activeConditions, conditionId];
    saveConditions(updated);
  };

  const setConditions = (conditions: ConditionId[]) => {
    saveConditions(conditions);
  };

  const applyPresetProfile = (
    preset: 'diabetic' | 'hypertensive' | 'lactose' | 'gout' | 'gluten' | 'healthy'
  ) => {
    switch (preset) {
      case 'diabetic':
        saveConditions(['diabetes_type_2']);
        break;
      case 'hypertensive':
        saveConditions(['hypertension']);
        break;
      case 'lactose':
        saveConditions(['lactose_intolerance']);
        break;
      case 'gout':
        saveConditions(['uric_acid_gout']);
        break;
      case 'gluten':
        saveConditions(['gluten_sensitivity']);
        break;
      case 'healthy':
        saveConditions([]);
        break;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        user,
        activeConditions,
        toggleCondition,
        setConditions,
        applyPresetProfile,
        isProfileDrawerOpen,
        setIsProfileDrawerOpen,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
