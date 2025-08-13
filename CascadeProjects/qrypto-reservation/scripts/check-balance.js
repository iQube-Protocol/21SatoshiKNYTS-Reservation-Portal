async function main() {
    const [signer] = await ethers.getSigners();
    const balance = await signer.getBalance();
    console.log(`Wallet address: ${signer.address}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
