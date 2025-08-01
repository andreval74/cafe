<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status do Deploy - SmartContract.Cafe</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0D1117 0%, #1a1a2e 100%);
            color: #e6e6e6;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
            color: #E5A050;
            text-align: center;
            margin-bottom: 30px;
        }
        .status-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #E5A050;
        }
        .success { border-left-color: #28a745; }
        .error { border-left-color: #dc3545; }
        .warning { border-left-color: #ffc107; }
        .info { border-left-color: #17a2b8; }
        
        .btn {
            background: linear-gradient(135deg, #E5A050 0%, #D2691E 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(229, 160, 80, 0.3);
        }
        
        .log-container {
            background: #0a0a0a;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        
        .refresh {
            text-align: center;
            margin: 20px 0;
        }
    </style>
    <meta http-equiv="refresh" content="30">
</head>
<body>
    <div class="container">
        <h1>🚀 Status do Deploy - SmartContract.Cafe</h1>
        
        <?php
        $repo_path = __DIR__;
        $log_file = $repo_path . '/deploy.log';
        
        // Função para obter informações do Git
        function getGitInfo($command) {
            global $repo_path;
            chdir($repo_path);
            return trim(exec($command . ' 2>/dev/null') ?: 'N/A');
        }
        
        // Informações do repositório
        $current_commit = getGitInfo('git rev-parse HEAD');
        $current_branch = getGitInfo('git branch --show-current');
        $last_commit_msg = getGitInfo('git log -1 --pretty=format:"%s"');
        $last_commit_date = getGitInfo('git log -1 --pretty=format:"%ci"');
        $remote_status = getGitInfo('git status -uno --porcelain');
        
        // Status do repositório
        $is_clean = empty($remote_status);
        $status_class = $is_clean ? 'success' : 'warning';
        $status_text = $is_clean ? '✅ Sincronizado' : '⚠️ Há alterações locais';
        ?>
        
        <div class="status-card <?php echo $status_class; ?>">
            <h3>Status do Repositório: <?php echo $status_text; ?></h3>
            <p><strong>Branch:</strong> <?php echo htmlspecialchars($current_branch); ?></p>
            <p><strong>Commit Atual:</strong> <?php echo substr($current_commit, 0, 8); ?></p>
            <p><strong>Última Alteração:</strong> <?php echo htmlspecialchars($last_commit_msg); ?></p>
            <p><strong>Data:</strong> <?php echo $last_commit_date; ?></p>
        </div>
        
        <div class="refresh">
            <a href="deploy.php" class="btn">🔄 Deploy Manual</a>
            <a href="?" class="btn">🔍 Atualizar Status</a>
            <a href="index.html" class="btn">🏠 Ir para o Site</a>
        </div>
        
        <div class="status-card info">
            <h3>📋 Últimos Logs de Deploy</h3>
            <?php if (file_exists($log_file)): ?>
                <div class="log-container">
                    <?php 
                    $logs = file_get_contents($log_file);
                    $log_lines = explode("\n", $logs);
                    $recent_logs = array_slice($log_lines, -50); // Últimas 50 linhas
                    echo htmlspecialchars(implode("\n", $recent_logs));
                    ?>
                </div>
                <p><small>Mostrando últimas 50 linhas. Página atualiza automaticamente a cada 30 segundos.</small></p>
            <?php else: ?>
                <p>Nenhum log de deploy encontrado ainda.</p>
            <?php endif; ?>
        </div>
        
        <div class="status-card info">
            <h3>📊 Informações do Sistema</h3>
            <p><strong>Diretório:</strong> <?php echo $repo_path; ?></p>
            <p><strong>PHP Version:</strong> <?php echo PHP_VERSION; ?></p>
            <p><strong>Git Disponível:</strong> <?php echo exec('which git') ? '✅ Sim' : '❌ Não'; ?></p>
            <p><strong>Última Verificação:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        </div>
    </div>
</body>
</html>
