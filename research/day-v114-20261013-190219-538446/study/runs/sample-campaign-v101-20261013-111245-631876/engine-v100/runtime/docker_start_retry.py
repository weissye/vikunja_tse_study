"""Bounded retry of Docker start ONLY for explicit port-binding conflicts."""
import subprocess,json,time

def is_port_conflict(stderr):
    s=stderr.lower()
    return ('ports are not available' in s and 'bind:' in s and
            ('only one usage of each socket address' in s or 'address already in use' in s))

def start_container(name,record=lambda r:None,run=subprocess.run,sleep=time.sleep,attempts=6):
    if not 1<=attempts<=6:raise ValueError('Start attempt bound exceeded')
    for attempt in range(1,attempts+1):
        try:
            result=run(['docker','start',name],check=True,capture_output=True,text=True,timeout=120)
            record({'action':'docker-start','attempt':attempt,'status':'START_COMMAND_SUCCEEDED'})
            return result.stdout
        except subprocess.CalledProcessError as error:
            detail=(error.stderr or '').strip()
            retryable=is_port_conflict(detail)
            record({'action':'docker-start','attempt':attempt,'status':'START_COMMAND_FAILED','retryable_port_conflict':retryable,'error':detail[:1500]})
            if not retryable:raise RuntimeError('Docker start failed: '+detail[:1500]) from error
            # A contradictory start error does not justify restarting an already running container.
            try:
                inspected=run(['docker','inspect','--format','{{json .State}}',name],check=True,capture_output=True,text=True,timeout=15)
                state=json.loads(inspected.stdout)
                if state.get('Running') and not state.get('Restarting'):
                    record({'action':'docker-start','attempt':attempt,'status':'ALREADY_RUNNING_REQUIRES_API_VERIFICATION'})
                    return ''
            except (subprocess.SubprocessError,ValueError):pass
            if attempt==attempts:raise RuntimeError('Docker port conflict persists after '+str(attempts)+' bounded start attempts') from error
            delay=min(2**attempt,10)
            record({'action':'docker-start','attempt':attempt,'status':'WAITING_FOR_RETRY','delay_seconds':delay})
            print('Docker port conflict; retrying start in '+str(delay)+' seconds; no SUT write replay',flush=True)
            sleep(delay)
