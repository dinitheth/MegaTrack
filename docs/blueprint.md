# **App Name**: MegaETH Watcher

## Core Features:

- Recent Blocks Display: Display the last 25 blocks, updating every 5 seconds with block number, timestamp, gas used, and hash, converting hex values to readable formats. Link block hashes to MegaExplorer.
- Wallet Balance Checker: Allow users to input a MegaETH address and view the wallet's MEGA balance, updated in real-time, formatted to 4 decimal places.
- Transfer Feed: Poll for ERC-20 transfer events every 10 seconds, displaying a human-readable list of transfers with links to MegaExplorer.
- Contract Inspector: Provide an input for contract addresses. Check and display smart contract bytecode size or indicate if it's an EOA. Offer a link to 'View on Explorer'.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) to reflect blockchain's reliable yet modern feel.
- Background color: Light grey (#F0F2F5), desaturated and light to ensure readability and reduce eye strain.
- Accent color: A purple-blue (#4B0082) adds depth and contrast to the visual experience, used to highlight interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif for a modern and neutral feel.
- Implement a responsive, mobile-friendly layout, with clear sections for Recent Blocks, Wallet Checker, Transfer Feed, and Contract Inspector.
- Use subtle animations for loading states to improve user experience during data fetching.