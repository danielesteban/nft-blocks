const { balance, ether, expectRevert } = require('@openzeppelin/test-helpers');

const BlocksToken = artifacts.require('BlocksToken');

const hash = 'Qmd5iiYoUnm9sFLF4Ec3Vgn3kjoBMkGUpZBuxtBi92t1Qa';

contract('Blocks token', (accounts) => {
  it('Should have deployer as owner', async () => {
    const instance = await BlocksToken.deployed();
    const owner = await instance.owner();
    assert.equal(owner, accounts[0]);
  });

  it('Should create token with specified hash', async () => {
    const instance = await BlocksToken.deployed();
    await instance.mint(hash);
    const stored = await instance.hash(0);
    assert.equal(stored, hash);
  });

  it('Should error when not owner and minting without enough value', async () => {
    const instance = await BlocksToken.deployed();
    await expectRevert(
      instance.mint(hash, { from: accounts[1] }),
      'BlocksToken: minting query without enough value'
    );
  });

  it('Should transfer minting cost to owner', async () => {
    const value = ether('0.005').toString();
    const instance = await BlocksToken.deployed();
    const owner = await instance.owner();
    const tracker = await balance.tracker(owner);
    await instance.mint(hash, { from: accounts[1], value });
    const delta = await tracker.delta();
    assert.equal(delta.toString(), value);
  });
});
