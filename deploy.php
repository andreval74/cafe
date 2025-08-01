<?php
/**
 * Script de Deploy Manual
 * Execute este script para atualizar manualmente o servidor com as últimas alterações do GitHub
 */

set_time_limit(300); // 5 minutos timeout
ini_set('display_errors', 1);
error_reporting(E_ALL);

$log_file = __DIR__ . '/deploy.log';

function writeLog($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] MANUAL: $message\n", FILE_APPEND | LOCK_EX);
    echo "[$timestamp] $message\n";
}

function executeCommand($command) {
    writeLog("Executando: $command");
    exec($command . ' 2>&1', $output, $return_code);
    
    foreach ($output as $line) {
        writeLog("OUTPUT: $line");
    }
    
    if ($return_code !== 0) {
        writeLog("ERRO: Comando falhou com código $return_code");
        return false;
    }
    
    writeLog("SUCESSO: Comando executado com sucesso");
    return true;
}

echo "<h1>Deploy Manual - SmartContract.Cafe</h1>\n";
echo "<pre>\n";

writeLog('=== INICIANDO DEPLOY MANUAL ===');

// Verificar se git está disponível
if (!exec('which git') && !exec('where git')) {
    writeLog('ERRO: Git não encontrado no sistema');
    exit(1);
}

// Mudar para o diretório do script
chdir(__DIR__);
writeLog('Diretório atual: ' . getcwd());

// Verificar status do Git
writeLog('Verificando status do repositório...');
if (!executeCommand('git status --porcelain')) {
    writeLog('ERRO: Falha ao verificar status do Git');
    exit(1);
}

// Buscar alterações do repositório remoto
writeLog('Buscando alterações do GitHub...');
if (!executeCommand('git fetch origin')) {
    writeLog('ERRO: Falha ao buscar alterações do GitHub');
    exit(1);
}

// Verificar diferenças
writeLog('Verificando diferenças...');
executeCommand('git log HEAD..origin/main --oneline');

// Fazer backup de arquivos locais modificados
writeLog('Fazendo backup de alterações locais...');
executeCommand('git stash push -m "Backup antes do deploy ' . date('Y-m-d H:i:s') . '"');

// Atualizar para a versão mais recente
writeLog('Atualizando para a versão mais recente...');
if (!executeCommand('git reset --hard origin/main')) {
    writeLog('ERRO: Falha ao atualizar repositório');
    exit(1);
}

// Limpar arquivos não rastreados
writeLog('Limpando arquivos não rastreados...');
executeCommand('git clean -fd');

// Verificar integridade
writeLog('Verificando integridade dos arquivos...');
if (!executeCommand('git status')) {
    writeLog('ERRO: Problemas na integridade do repositório');
    exit(1);
}

// Limpar cache se disponível
if (function_exists('opcache_reset')) {
    opcache_reset();
    writeLog('Cache OPcache limpo');
}

if (function_exists('apcu_clear_cache')) {
    apcu_clear_cache();
    writeLog('Cache APCu limpo');
}

writeLog('=== DEPLOY CONCLUÍDO COM SUCESSO ===');
writeLog('Último commit: ' . trim(exec('git rev-parse HEAD')));
writeLog('Data/hora do deploy: ' . date('Y-m-d H:i:s'));

echo "\n</pre>\n";
echo "<h2>✅ Deploy realizado com sucesso!</h2>\n";
echo "<p>O servidor foi atualizado com as últimas alterações do GitHub.</p>\n";
echo "<p><a href='deploy.log'>Ver log completo</a> | <a href='index.html'>Ir para o site</a></p>\n";
?>
