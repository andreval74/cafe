// Seu JavaScript original do Gerador de Link MetaMask, movido para arquivo externo
let allNetworks = [];
let selectedNetwork = null;

const rpcFallbacks = {
    // Adiciona RPCs públicos alternativos para redes problemáticas
    97: [
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
        "https://data-seed-prebsc-2-s1.binance.org:8545/",
        "https://bsc-testnet.publicnode.com",
        "https://endpoints.omniatech.io/v1/bsc/testnet/public",
        "https://bsc-testnet.public.blastapi.io"
    ],
    56: [
        "https://bsc-dataseed.binance.org",
        "https://bsc-mainnet.public.blastapi.io",
        "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
        "https://bsc.publicnode.com"
    ],
    1: [
        "https://rpc.ankr.com/eth",
        "https://mainnet.infura.io/v3/YOUR_INFURA_KEY", // Lembre-se de substituir YOUR_INFURA_KEY
        "https://cloudflare-eth.com"
    ],
    137: [
        "https://polygon-rpc.com",
        "https://polygon-mainnet.public.blastapi.io",
        "https://rpc.ankr.com/polygon"
    ]
    // Adicione mais conforme necessário
};

async function fetchNetworks() {
    const res = await fetch('https://chainid.network/chains.json');
    allNetworks = await res.json();
    document.getElementById('networkSection').style.display = "block";
    document.getElementById('networkSearch').addEventListener('input', filterNetworks);
}

function filterNetworks() {
    const query = document.getElementById('networkSearch').value.toLowerCase();
    const filtered = allNetworks.filter(n =>
        n.name.toLowerCase().includes(query) || n.chainId.toString().includes(query)
    );
    const select = document.getElementById('networkSelect');
    select.innerHTML = "";
    filtered.forEach(n => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify(n);
        opt.textContent = `${n.name} (${n.chainId})`;
        select.appendChild(opt);
    });
}

document.getElementById('networkSelect').addEventListener('change', (e) => {
    const selected = JSON.parse(e.target.value);
    selectedNetwork = selected;
    document.getElementById('chainId').value = "0x" + parseInt(selected.chainId).toString(16);
    document.getElementById('chainName').value = selected.name;
    document.getElementById('rpcUrl').value = selected.rpc[0];
    document.getElementById('blockExplorer').value = selected.explorers ? selected.explorers[0].url : "";
    document.getElementById('nativeCurrency').value = selected.nativeCurrency.symbol;
    document.getElementById('nativeDecimals').value = selected.nativeCurrency.decimals;
});

async function fetchTokenData() {
    const tokenAddress = document.getElementById('tokenAddress').value.trim();
    if (!tokenAddress) {
        alert("⚠️ Informe o endereço do token.");
        return;
    }
    if (!selectedNetwork || !selectedNetwork.rpc || selectedNetwork.rpc.length === 0) {
        alert("⚠️ Nenhuma rede selecionada.");
        return;
    }

    let rpcList = [...selectedNetwork.rpc];
    if (rpcFallbacks[selectedNetwork.chainId]) {
        rpcList = rpcList.concat(rpcFallbacks[selectedNetwork.chainId]);
    }

    let provider;
    let connected = false;

    for (let rpcUrl of rpcList) {
        try {
            provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            await provider.getNetwork();
            connected = true;
            document.getElementById('rpcUrl').value = rpcUrl;
            break;
        } catch (err) {
            // Silencia warnings para RPCs que falham
        }
    }

    if (!connected) {
        alert("❌ Não foi possível conectar a nenhum RPC da rede selecionada.");
        return;
    }

    try {
        const abi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
        ];
        const contract = new ethers.Contract(tokenAddress, abi, provider);

        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        document.getElementById('tokenSymbol').value = symbol;
        document.getElementById('tokenDecimals').value = decimals;
        document.getElementById('tokenImage').value = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${selectedNetwork.name.toLowerCase()}/assets/${tokenAddress}/logo.png`;
        alert(`✅ Token ${symbol} detectado com sucesso!`);
    } catch (err) {
        console.error(err);
        alert("❌ Erro ao buscar dados do token. Verifique se o contrato está na rede selecionada.");
    }
}

function generateLink() {
    // Captura o caminho completo onde o sistema está rodando (e.g., /cafe/token-link/)
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/')) + '/';
    // Assumindo que add.html estará na mesma pasta do index.html (cafe/token-link/add.html)
    // Se add.html estiver na raiz de 'cafe/' (cafe/add.html), mude para:
    // const baseUrl = window.location.origin + "/cafe/add.html";
    const baseUrl = window.location.origin + basePath + "add.html"; 
    
    const data = {
        chainId: document.getElementById('chainId').value,
        chainName: document.getElementById('chainName').value,
        rpcUrl: document.getElementById('rpcUrl').value,
        blockExplorer: document.getElementById('blockExplorer').value,
        nativeCurrency: document.getElementById('nativeCurrency').value,
        nativeDecimals: document.getElementById('nativeDecimals').value,
        tokenAddress: document.getElementById('tokenAddress').value,
        tokenSymbol: document.getElementById('tokenSymbol').value,
        tokenDecimals: document.getElementById('tokenDecimals').value,
        tokenImage: document.getElementById('tokenImage').value
    };
    const encoded = btoa(JSON.stringify(data));
    const link = `${baseUrl}?data=${encoded}`;
    document.getElementById('generatedLink').value = link;
    document.getElementById('actionButtons').classList.add('visible');
}

function copyLink() {
    const textarea = document.getElementById('generatedLink');
    textarea.select();
    document.execCommand('copy');
    alert("✅ Link copiado para a área de transferência!");
}

function shareLink() {
    const link = document.getElementById('generatedLink').value;
    if (navigator.share) {
        navigator.share({ text: "Adicione esta rede e token ao MetaMask", url: link });
    } else {
        alert("❌ Compartilhamento direto não suportado neste navegador.");
    }
}

// Adiciona a classe 'filled' se o campo já tiver valor ao carregar a página
// O listener de 'blur' está agora no main.js global.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input, textarea, select').forEach(function(el) {
        if (el.value) {
            el.classList.add('filled');
        }
    });
});