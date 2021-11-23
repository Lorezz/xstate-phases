import { createMachine, assign } from 'xstate';
import data from './data.json';

const doTest = (context) => {
  const t = context.tests[context.index];
  const chance = Math.random();
  console.log('run test', t?.id, t?.title);
  console.log('chance', chance);
  return chance > 0.1 ? Promise.resolve(t) : Promise.reject(t);
};

const phaseMachine = createMachine(
  {
    id: 'op',
    initial: 'idle',
    context: {
      phases: data.phases,
      phaseIndex: -1,
      tests: [],
      index: 0,
    },
    states: {
      idle: {
        id: 'idle',
        on: {
          START: {
            target: 'active',
            actions: ['nextPhase', 'setOps', 'logTests'],
          },
        },
      },
      active: {
        id: 'active',
        initial: 'running',
        states: {
          running: {
            invoke: {
              id: 'doTest',
              src: doTest,
              onDone: {
                target: 'success',
              },
              onError: {
                target: 'failure',
              },
            },
          },
          success: {
            on: {
              NEXT: [
                {
                  target: '#done',
                  cond: 'isDone',
                  actions: [() => console.log('DONE')],
                },
                {
                  target: 'running',
                  cond: 'testsCompleted',
                  actions: [
                    () => console.log('TESTS COMPLETED'),
                    'nextPhase',
                    'setOps',
                    'logTests',
                  ],
                },
                {
                  target: 'running',
                  actions: ['nextTest', () => console.log('NEXT TEST')],
                },
              ],
            },
          },
          failure: {
            on: {
              RETRY: 'running',
            },
          },
          // completed: {
          //   id: 'completed',
          //   on: {
          //     NEXT: [
          //       {
          //         target: '#done',
          //         cond: 'isDone',
          //         actions: [() => console.log('DONE')],
          //       },
          //       {
          //         target: 'running',
          //         actions: ['nextPhase', 'setOps', 'logTests'],
          //       },
          //     ],
          //   },
          // },
        },
      },
      done: {
        id: 'done',
        on: {
          RESTART: {
            target: 'idle',
            actions: ['cleanup', () => console.log('RESET AND RESTART')],
          },
        },
      },
    },
  },
  {
    actions: {
      logTests: (context, event) => {
        console.log('tests', context.tests);
        console.log('current test', context.tests[context.index]);
      },
      nextTest: assign({
        index: (context) => context.index + 1,
      }),
      nextPhase: assign({
        phaseIndex: (context) => context.phaseIndex + 1,
      }),
      setOps: assign({
        tests: (context) => context.phases[context.phaseIndex].operations,
        index: () => 0,
      }),
      cleanup: assign({
        tests: () => [],
        index: () => 0,
        phaseIndex: () => -1,
      }),
    },
    guards: {
      testsCompleted: (context) => context.index >= context.tests.length - 1,
      isDone: (context) =>
        context.index >= context.tests.length - 1 &&
        context.phaseIndex >= context.phases.length - 1,
    },
  }
);

export default phaseMachine;
