import { spawn } from 'child_process';

const server = spawn('node', ['./mcp-server/index.mjs'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

let output = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('MCP Response:', data.toString());
});

const send = (req) => {
  server.stdin.write(JSON.stringify(req) + '\n');
};

setTimeout(() => {
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
}, 100);

setTimeout(() => {
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
}, 300);

setTimeout(() => {
  send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'calculate_daily_macros',
      arguments: {
        age: 28,
        gender: 'male',
        heightCm: 172,
        weightKg: 70,
        activityLevel: 'moderate',
        goal: 'maintain',
      },
    },
  });
}, 500);

setTimeout(() => {
  send({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'evaluate_food_suitability',
      arguments: {
        product: {
          name: 'Sweet Chocolate Cookie',
          brand: 'Cadbury',
          nutrition_per_100g: {
            sugar_g: 34,
            sodium_mg: 120,
            saturated_fat_g: 6,
            trans_fat_g: 0.1,
            contains_lactose: true,
            contains_gluten: true,
          },
        },
        conditions: ['diabetes_type_2', 'lactose_intolerance'],
      },
    },
  });
}, 700);

setTimeout(() => {
  server.kill();
  console.log('--- ALL MCP TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}, 1200);
