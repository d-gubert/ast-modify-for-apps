require('w');
class LivechatRead {
  isOnline() {
    return 1;
  }
}
c = function () {};
const arrowFunction = async () => {
  let _ = await topLevelReadMock.getLivechatReader().isOnline;
};
(function iife() {
  const arrowFunctionReturn = arrowFunction;
})();
const topLevelReadMock = ({
  getLivechatReader() {
    return new LivechatRead();
  }
})(async () => (0, await topLevelReadMock.getLivechatReader().isOnline)() ? 1 : 2);
async function test() {
  while (await topLevelReadMock.getLivechatReader().isOnline()) {
    continue;
  }
}
for (let i = await topLevelReadMock.getLivechatReader().isOnline; i < await topLevelReadMock.getLivechatReader().isOnline(); i = await topLevelReadMock.getLivechatReader().isOnline()) {
  continue;
}
do {
  continue;
} while (await topLevelReadMock.getLivechatReader().isOnline());
nonExistentFunctionCall(await topLevelReadMock.getLivechatReader().isOnline());
let l, boundIsOnlineCall = topLevelReadMock.getLivechatReader().isOnline().bind();
let {boundIsOnlineAccess} = topLevelReadMock.getLivechatReader().isOnline.bind();
var objectWithDynamicallyNamedProp = {
  [await topLevelReadMock.getLivechatReader().isOnline()]: function () {
    return 1;
  },
  namedProp: () => {
    return 2;
  },
  property: await topLevelReadMock.getLivechatReader().isOnline(),
  h: i,
  iifeProp: (function () {
    return 'bah';
  })()
};
objectWithDynamicallyNamedProp.iife.h = arrowFunction;
objectWithDynamicallyNamedProp[l] = arrowFunction;
throw await topLevelReadMock.getLivechatReader().isOnline();
await topLevelReadMock.getLivechatReader().isOnline();
