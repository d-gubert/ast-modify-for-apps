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
  const arrowFunctionReturn = arrowFunction;
})();

const topLevelReadMock = { getLivechatReader() { return new LivechatRead() } }

(() => (0,topLevelReadMock.getLivechatReader().isOnline)() ? 1 : 2)

function test() {
    while (topLevelReadMock.getLivechatReader().isOnline()) {
        continue;
    }
}

for (let i = topLevelReadMock.getLivechatReader().isOnline; i < topLevelReadMock.getLivechatReader().isOnline(); i = topLevelReadMock.getLivechatReader().isOnline()) {
  continue;
}

do {
  continue;
} while(await topLevelReadMock.getLivechatReader().isOnline());

nonExistentFunctionCall(topLevelReadMock.getLivechatReader().isOnline())

let l, boundIsOnlineCall = topLevelReadMock.getLivechatReader().isOnline().bind();

let { boundIsOnlineAccess } = topLevelReadMock.getLivechatReader().isOnline.bind();

var objectWithDynamicallyNamedProp = {
  [topLevelReadMock.getLivechatReader().isOnline()]: function() { return 1; },
  namedProp: () => { return 2 },
  property: topLevelReadMock.getLivechatReader().isOnline(),
  h: i,
  iifeProp: (function() { return 'bah' })(),
}

objectWithDynamicallyNamedProp.iife.h = arrowFunction;
objectWithDynamicallyNamedProp[l] = arrowFunction;

throw topLevelReadMock.getLivechatReader().isOnline()

topLevelReadMock.getLivechatReader().isOnline()
