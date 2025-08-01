# Deploy Configuration for SmartContract.Cafe

## Configuração Automática com GitHub Webhooks

### 1. Configurar Webhook no GitHub

1. Vá para o repositório no GitHub: https://github.com/andreval74/cafe
2. Clique em **Settings** > **Webhooks** > **Add webhook**
3. Configure:
   - **Payload URL**: `https://seu-dominio.com/webhook.php`
   - **Content type**: `application/json`
   - **Secret**: `smartcontract_cafe_webhook_secret_2025`
   - **Events**: Selecione "Just the push event"
   - **Active**: ✅ Marcado

### 2. Deploy Manual

Para atualizar manualmente o servidor:
- Acesse: `https://seu-dominio.com/deploy.php`
- O script irá automaticamente baixar e aplicar as últimas alterações

### 3. Comandos do Servidor (via SSH)

```bash
# Navegar para o diretório do projeto
cd /path/to/your/website

# Atualizar manualmente
git fetch origin
git reset --hard origin/main
git clean -fd

# Verificar status
git status
git log --oneline -5
```

### 4. Estrutura de Arquivos Criados

```
projeto/
├── webhook.php          # Receptor de webhooks do GitHub
├── deploy.php          # Script de deploy manual
├── deploy.log          # Log de deployments
└── DEPLOY-CONFIG.md    # Este arquivo
```

### 5. Segurança

- O webhook usa assinatura HMAC SHA-256 para validação
- Logs são mantidos para auditoria
- Backup automático antes de cada deploy

### 6. Monitoramento

- Logs são salvos em `deploy.log`
- Cada deploy é registrado com timestamp
- Códigos de erro são capturados

### 7. Troubleshooting

**Problema**: Deploy não funciona
**Solução**: 
1. Verificar permissões do diretório
2. Confirmar que Git está instalado
3. Verificar conectividade com GitHub

**Problema**: Webhook não responde
**Solução**:
1. Verificar URL do webhook
2. Confirmar secret key
3. Verificar logs do servidor web

### 8. URLs Importantes

- Deploy manual: `https://seu-dominio.com/deploy.php`
- Webhook endpoint: `https://seu-dominio.com/webhook.php` 
- Logs: `https://seu-dominio.com/deploy.log`

### 9. Fluxo de Trabalho

1. **Desenvolvimento**: Edite arquivos no VS Code
2. **Commit**: `git add . && git commit -m "suas alterações"`
3. **Push**: `git push origin main`
4. **Deploy Automático**: Webhook atualiza servidor automaticamente
5. **Verificação**: Acesse o site para confirmar alterações

### 10. Configuração do Servidor

Certifique-se de que o servidor tenha:
- Git instalado
- PHP 7.4+ com exec() habilitado
- Permissões de escrita no diretório
- Conectividade com GitHub (porta 443)
