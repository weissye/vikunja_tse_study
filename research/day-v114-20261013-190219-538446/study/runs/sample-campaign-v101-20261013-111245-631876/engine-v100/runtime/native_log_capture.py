"""File-backed native output: no pipe-reader thread or EOF join dependency."""
import codecs,re

def fatal_line(line):
 return bool(re.search(r'\bERROR:|\bFAIL:|Test Result: (FAIL|ERROR)|Switching to test fail mode|\sERR\s',line))

def valid_prefix(log):
 result=[]
 for line in log.splitlines(keepends=True):
  if fatal_line(line):break
  result.append(line)
 return ''.join(result)

class NativeLogCapture:
 def __init__(self,run,gateway,lines,fatal):
  folder=run/'.private-snapshots';folder.mkdir(exist_ok=True)
  self.raw_writer=(folder/'native-output.log').open('wb',buffering=0)
  self.raw_reader=(folder/'native-output.log').open('rb',buffering=0)
  self.output=(run/'native.log').open('w',encoding='utf-8')
  self.gateway=gateway;self.lines=lines;self.fatal=fatal
  self.decoder=codecs.getincrementaldecoder('utf-8')('replace');self.pending='';self.closed=False
 def consume(self,text):
  for secret in list(self.gateway.secrets):
   if secret:text=text.replace(secret,'[REDACTED]')
  self.lines.append(text);self.output.write(text);self.output.flush()
  if fatal_line(text):self.fatal.set()
 def pump(self):
  if self.closed:return
  # Bounded reads permit the supervisor to enforce its deadline.
  chunk=self.raw_reader.read(65536)
  if chunk:self.pending+=self.decoder.decode(chunk)
  while '\n' in self.pending:
   line,self.pending=self.pending.split('\n',1);self.consume(line+'\n')
  return bool(chunk)
 def join(self,timeout=None):
  if self.closed:return
  self.raw_writer.close()
  while self.pump():pass
  self.pending+=self.decoder.decode(b'',final=True)
  if self.pending:self.consume(self.pending);self.pending=''
  self.output.close();self.raw_reader.close();self.closed=True
 def is_alive(self):return False
