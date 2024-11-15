const GiveCoin = artifacts.require("GiveCoin");
const Escrow = artifacts.require("Escrow");
const Campaign = artifacts.require("Campaign");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("GiveCoin & Escrow", ([owner, customer, donor]) => {
  let givecoin, escrow;
  let campaign;

  function tokens(number) {
    return web3.utils.toWei(number, "ether");
  }

  before(async () => {
    // Deploy GiveCoin contract
    givecoin = await GiveCoin.new();

    // Deploy CampaignManager contract
    escrow = await Escrow.new(givecoin.address);

    // Transfer 300 tokens to donor
    // await givecoin.transfer(customer, tokens("0"), { from: owner });

    await givecoin.transfer(donor, tokens("300"), { from: owner });

    // Create a campaign through CampaignManager
    await escrow.createCampaign("Campaign 1", "Description of campaign", tokens("1000"), { from: customer });

    // Get the campaign address from the CampaignManager and interact with the deployed Campaign
    const campaignAddress = await escrow.campaigns(0); // Get the first campaign's address
    campaign = await Campaign.at(campaignAddress);  // Interact with the Campaign contract directly

    // campaign.setMilestone(tokens("50"), {from: customer});
  });

  describe("GiveCoin Deployment", () => {
    it("matches name successfully", async () => {
      const name = await givecoin.name();
      assert.equal(name, "GiveCoin");
    });

    it("check balance of owner", async () => {
      const balance = await givecoin.balanceOf(owner);
      assert.equal(balance.toString(), tokens("999999700"));
    });

    it("check balance of customer", async () => {
      const balance = await givecoin.balanceOf(donor);
      assert.equal(balance.toString(), tokens("300"));
    });
  });

  describe("Escrow Contract", () => {
    it("should create a campaign and set the correct details", async () => {
      // Fetch the campaign name from the Campaign contract
      const name = await campaign.name();
      const description = await campaign.description();
      const amountNeeded = await campaign.totalAmountNeeded();
      const owner = await campaign.owner();

      assert.equal(name, "Campaign 1");
      assert.equal(description, "Description of campaign");
      assert.equal(amountNeeded.toString(), tokens("1000"));
      assert.equal(owner, customer);
    });

    it("should allow donations to the campaign", async () => {
      // Ensure the campaign contract is approved to transfer the tokens
      await givecoin.approve(escrow.address, tokens("100"), { from: donor });

      // Log the approval status to ensure it's correctly set
      const allowance = await givecoin.allowance(donor, escrow.address);
      assert.equal(allowance.toString(), tokens("100"), "Allowance was not set correctly");

      // Can't donate to your own campaign
      await escrow.donateCoin(tokens("100"), campaign.address, { from: customer }).should.be.rejected;

      // Can't donated less than 0 tokens
      await escrow.donateCoin(tokens("0"), campaign.address, { from: customer }).should.be.rejected;

      // Donate tokens to the campaign
      await escrow.donateCoin(tokens("100"), campaign.address, { from: donor });

      // const balance = await givecoin.balanceOf(escrow.address);
      // assert.equal(balance.toString(), tokens("100"));

      // await escrow.issueCoin({ from: owner });

      const a = await campaign.getDonatedAmount({ from: donor });
      assert.equal(a.toString(), tokens("100"));

      // const b = await givecoin.balanceOf(escrow.address);
      // assert.equal(b.toString(), tokens("50"));

      // const totalReceived = await campaign.totalAmountReceived();
      // assert.equal(totalReceived.toString(), tokens("50"));

      // const overflow = await givecoin.balanceOf(escrow.address);
      // assert.equal(overflow.toString(), tokens("50"));

      // await campaign.approveMilestone({ from: customer });

      // await escrow.issueCoin({ from: owner });

      // const tr = await campaign.totalAmountReceived();
      // assert.equal(tr.toString(), tokens("100"));
    });


    it("should emit CampaignCreated event on campaign creation", async () => {
      const receipt = await escrow.createCampaign("Campaign 2", "Description of campaign 2", tokens("2000"), { from: customer });

      // console.log("Transaction Receipt: ", receipt); // Log the entire receipt to check for events

      const event = receipt.logs.find((log) => log.event === "CampaignCreated");
      assert(event, "CampaignCreated event not found");

      // Check the event arguments (use the correct property names if needed)
      event.args[0].should.equal(customer);
      event.args[1].toString().should.not.equal('0');  // Ensure a valid campaign ID was emitted
    });

  });
});
