require('w');

class LivechatRead {
  isOnline() {
    return 1;
  }
}

const arrowFunction = () => {
  let _ = a.getLivechatReader().isOnline;
}

arrowFunction();

const a = { getLivechatReader() { return new LivechatRead() } }

a.getLivechatReader().isOnline();

function test() {
    while (a.getLivechatReader().isOnline()) {
        continue;
    }
}

for (let i = a.getLivechatReader().isOnline; i < a.getLivechatReader().isOnline(); i = a.getLivechatReader().isOnline()) {
  continue;
}

do {
  continue;
} while(await a.getLivechatReader().isOnline());

b(a.getLivechatReader().isOnline())

let boundIsOnlineCall = a.getLivechatReader().isOnline().bind();

let boundIsOnlineAccess = a.getLivechatReader().isOnline.bind();

var x = {
  [a.getLivechatReader().isOnline()]: a.getLivechatReader().isOnline()
}

throw a.getLivechatReader().isOnline()

a.getLivechatReader().isOnline()
