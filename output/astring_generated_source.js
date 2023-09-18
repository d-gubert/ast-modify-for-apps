(async (exports,module,require,globalThis,Deno) => {
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
(async function iife() {
  const arrowFunctionReturn = await arrowFunction();
})();
const topLevelReadMock = {
  getLivechatReader() {
    return new LivechatRead();
  }
};
await topLevelReadMock.getLivechatReader().isOnline();
async function test() {
  while (await topLevelReadMock.getLivechatReader().isOnline()) {
    continue;
  }
}
await test();
for (let i = await topLevelReadMock.getLivechatReader().isOnline; i < await topLevelReadMock.getLivechatReader().isOnline(); i = await topLevelReadMock.getLivechatReader().isOnline()) {
  continue;
}
do {
  continue;
} while (await topLevelReadMock.getLivechatReader().isOnline());
nonExistentFunctionCall(await topLevelReadMock.getLivechatReader().isOnline());
let boundIsOnlineCall = topLevelReadMock.getLivechatReader().isOnline().bind();
let {boundIsOnlineAccess} = topLevelReadMock.getLivechatReader().isOnline.bind();
var objectWithDynamicallyNamedProp = {
  [await topLevelReadMock.getLivechatReader().isOnline()]: function () {
    return 1;
  },
  namedProp: () => {
    return 2;
  },
  property: await topLevelReadMock.getLivechatReader().isOnline(),
  iifeProp: (function () {
    return 'bah';
  })()
};
throw await topLevelReadMock.getLivechatReader().isOnline();
await topLevelReadMock.getLivechatReader().isOnline();
;
  })(exports,module,require);
  