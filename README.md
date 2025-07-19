# MegaTrack - MegaETH Testnet Dashboard

MegaTrack is a real-time, on-chain dashboard for the MegaETH testnet. It provides users with a clean, responsive, and intuitive interface to monitor network activity, inspect contracts, and track token movements.

## ✨ Features

-   **Live Network Stats**: Get up-to-the-second metrics on network performance, including Block Time, Average Transactions Per Second (TPS), and Average Gas Used per block.
-   **Recent Blocks Feed**: See a live-updating list of the latest blocks mined on the MegaETH chain, with links to view them on the explorer.
-   **ERC-20 Transfer Feed**: Monitor recent ERC-20 token transfers happening on the network. Includes the ability to filter by a specific token contract address.
-   **Wallet Balance Checker**: Quickly check the MEGA balance of any wallet address.
-   **Contract Inspector**: Enter any address to determine if it's an Externally Owned Account (EOA) or a smart contract, and view the contract's bytecode size.
-   **Responsive Design**: A sleek, modern "glassmorphism" UI that looks great on both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Blockchain Interaction**: Ethereum JSON-RPC via direct `fetch` calls

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/dinitheth/MegaTrack.git
    cd megatrack
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your MegaETH RPC URL. If you don't provide one, it will fall back to a public endpoint.
    ```env
    NEXT_PUBLIC_RPC_URL=https://your-megaeth-rpc-url.com
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) with your browser to see the result.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues
https://github.com/dinitheth/MegaTrack.git

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

Built by dinitheth
