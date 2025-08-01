<?php
/**
 * GitHub Webhook Handler
 * Este script recebe notificações do GitHub quando há push para o repositório
 * e automaticamente atualiza o servidor com as últimas alterações
 */

// Configurações
$secret = 'smartcontract_cafe_webhook_secret_2025'; // Altere esta chave secreta
$repo_path = __DIR__; // Diretório onde está o repositório
$log_file = __DIR__ . '/deploy.log';

// Função para log
function writeLog($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    writeLog('Método não permitido: ' . $_SERVER['REQUEST_METHOD']);
    exit('Método não permitido');
}

// Obter o payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verificar assinatura do GitHub
if (!$signature) {
    http_response_code(400);
    writeLog('Assinatura não fornecida');
    exit('Assinatura não fornecida');
}

$expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (!hash_equals($expected_signature, $signature)) {
    http_response_code(401);
    writeLog('Assinatura inválida');
    exit('Assinatura inválida');
}

// Decodificar payload
$data = json_decode($payload, true);
if (!$data) {
    http_response_code(400);
    writeLog('Payload JSON inválido');
    exit('Payload inválido');
}

// Verificar se é um push para a branch main
if ($data['ref'] !== 'refs/heads/main') {
    writeLog('Push ignorado - não é para a branch main: ' . $data['ref']);
    exit('Branch ignorada');
}

writeLog('Iniciando deploy automático...');

// Mudar para o diretório do repositório
chdir($repo_path);

// Comandos para atualizar o repositório
$commands = [
    'git fetch origin 2>&1',
    'git reset --hard origin/main 2>&1',
    'git clean -fd 2>&1'
];

$output = [];
$success = true;

foreach ($commands as $command) {
    writeLog("Executando: $command");
    exec($command, $command_output, $return_code);
    
    $output[] = "Comando: $command";
    $output[] = "Código de retorno: $return_code";
    $output[] = "Saída: " . implode("\n", $command_output);
    $output[] = "---";
    
    if ($return_code !== 0) {
        $success = false;
        writeLog("Erro no comando: $command - Código: $return_code");
        break;
    }
    
    $command_output = []; // Limpar para o próximo comando
}

if ($success) {
    writeLog('Deploy concluído com sucesso!');
    
    // Limpar cache se necessário
    if (function_exists('opcache_reset')) {
        opcache_reset();
        writeLog('Cache OPcache limpo');
    }
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deploy realizado com sucesso',
        'timestamp' => date('c'),
        'commit' => $data['head_commit']['id'] ?? 'unknown'
    ]);
} else {
    writeLog('Deploy falhou!');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha no deploy',
        'output' => $output,
        'timestamp' => date('c')
    ]);
}

writeLog('Script finalizado');
?>
