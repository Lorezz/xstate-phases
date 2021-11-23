import { useMachine } from '@xstate/react';
import phaseMachine from './phaseMachine';
import data from './data.json';

function App() {
  const [current, send] = useMachine(phaseMachine);
  const { context, value: state } = current;
  // console.log('STATE', state);
  // console.log('context', context);
  let phase = null;
  if (context.phaseIndex >= 0) {
    phase = context.phases[context.phaseIndex];
  }
  let test = null;
  if (phase) {
    test = context.tests[context.index];
  }
  return (
    <div className="App">
      <h1>STATE: {JSON.stringify(state)}</h1>
      <div>
        {typeof state === 'string' && state === 'idle' && (
          <button type="button" onClick={() => send('START')}>
            START
          </button>
        )}
        {typeof state === 'string' && state === 'done' && (
          <button type="button" onClick={() => send('RESTART')}>
            RESTART
          </button>
        )}
        {typeof state === 'object' && state['active'] && (
          <>
            <div>PHASE :{phase?.title}</div>
            <div>TEST : {test?.title}</div>
            <button type="button" onClick={() => send('NEXT')}>
              NEXT
            </button>
            <button type="button" onClick={() => send('RETRY')}>
              RETRY
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
