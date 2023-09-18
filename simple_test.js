require('w');

class LivechatRead {
  isOnline() {
    return 1;
  }
}

c = function() {
}


const arrowFunction = () => {
  let _ = topLevelReadMock.getLivechatReader().isOnline;
}

(function iife() {
  const arrowFunctionReturn = arrowFunction();
})();

const topLevelReadMock = { getLivechatReader() { return new LivechatRead() } }

topLevelReadMock.getLivechatReader().isOnline();

function test() {
    while (topLevelReadMock.getLivechatReader().isOnline()) {
        continue;
    }
}

test();

for (let i = topLevelReadMock.getLivechatReader().isOnline; i < topLevelReadMock.getLivechatReader().isOnline(); i = topLevelReadMock.getLivechatReader().isOnline()) {
  continue;
}

do {
  continue;
} while(await topLevelReadMock.getLivechatReader().isOnline());

nonExistentFunctionCall(topLevelReadMock.getLivechatReader().isOnline())

let boundIsOnlineCall = topLevelReadMock.getLivechatReader().isOnline().bind();

let { boundIsOnlineAccess } = topLevelReadMock.getLivechatReader().isOnline.bind();

var objectWithDynamicallyNamedProp = {
  [topLevelReadMock.getLivechatReader().isOnline()]: function() { return 1; },
  namedProp: () => { return 2 },
  property: topLevelReadMock.getLivechatReader().isOnline(),
  iifeProp: (function() { return 'bah' })(),
}

throw topLevelReadMock.getLivechatReader().isOnline()

topLevelReadMock.getLivechatReader().isOnline()

