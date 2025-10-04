## **Dados do Participante**

Nome: Jistriane Brunielli Silva de Oliveira

E-mail: jistrianedroid@gmail.com

**Nome:** Projeto Crypto Wallet com WhatsApp

**Ferramentas utilizadas:** Next.js, TypeScript, Tailwind CSS

**Link do repositório:** https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp

Data de inicio: 25/09/2025

Data de conclusão:04/10/2025
## **Relatório**
### **1. Qual trilha você testou?**
(X) Trilha A – Smart Wallet, KYC, Fiat, Portfolio, History

(X) Trilha B – Smart Wallet, KYC, Liquide Pools, Portfolio, History
### **2. Quais endpoints você testou com mais profundidade?**
- /auth/login - Autenticação com WhatsApp
- /auth/verify - Verificação 2FA
- /wallet/create - Criação de carteira
- /wallet/balance - Saldo da carteira
- /wallet/transactions - Histórico de transações
- /kyc/status - Status da verificação KYC
- /kyc/submit - Envio de documentos
- /whatsapp/verify - Verificação do WhatsApp
- /portfolio/analytics - Análise do portfólio
- /security/2fa - Configuração 2FA
### **3. Quais foram os principais bugs encontrados?**
1. **Endpoint**: /auth/verify
- Comportamento esperado: Retornar token após verificação
- Comportamento real: Às vezes retorna 500 mesmo com código correto
- Reprodutibilidade: Intermitente
- Gravidade: Alta
2. **Endpoint**: /whatsapp/verify
- Comportamento esperado: Enviar código imediatamente
- Comportamento real: Atraso significativo no envio
- Reprodutibilidade: Frequente
- Gravidade: Média
### **4. Quais comportamentos inesperados você identificou?**
1. Timeout em algumas chamadas de blockchain
2. Respostas inconsistentes no formato de datas
3. Alguns endpoints retornam HTML em vez de JSON em caso de erro
4. Inconsistência nos códigos de erro entre endpoints
### **5. Como foi a experiência de usar a API?**
- Documentação foi suficiente? 4/5
- Bem estruturada, mas faltam exemplos práticos
- Mensagens de erro ajudaram? 3/5
- Algumas mensagens são muito genéricas
- O fluxo fez sentido? 5/5
- Fluxo lógico e bem organizado
- Tempo de resposta era razoável? 4/5
- Bom em geral, exceto operações blockchain
### **6. Alguma funcionalidade estava ausente ou incompleta?**
1. Falta endpoint para cancelar transações pendentes
2. Não há rota para exportar histórico completo
3. Falta suporte a múltiplas carteiras
4. Ausência de webhooks para eventos de carteira
### **7. Quais melhorias você sugere?**
1. **Nomes de campos**:
- Padronizar nomenclatura (amount vs value)
- Usar camelCase consistentemente
2. **Design de endpoints**:
- Adicionar versionamento na URL
- Melhorar paginação
3. **Lógica de negócio**:
- Adicionar retry automático para operações blockchain
- Melhorar validação de endereços
4. **Retornos da API**:
- Padronizar formato de erros
- Incluir mais metadados nas respostas
### **8. Como você avaliaria a estabilidade geral da API nesta trilha?**
[X] Estável – poucos problemas, nada críticoA API é robusta e funcional, com alguns problemas menores que não comprometem o uso.
### **9. Há testes que você gostaria de ter feito, mas não conseguiu? Por quê?**
1. Testes de carga - Falta ambiente de staging
2. Testes de recuperação de carteira - Documentação insuficiente
3. Testes de integração com múltiplas redes - Limitação de testnet
### **10. Comentários finais ou insights gerais?**
1. **Pontos Positivos**:
- Excelente documentação base
- Boa estrutura de autenticação
- Integração WhatsApp bem implementada
- Suporte a múltiplas redes
2. **Sugestões de Melhoria**:
- Implementar rate limiting mais claro
- Melhorar documentação de erros
- Adicionar SDK oficial
- Expandir exemplos de integração
3. **Considerações Estratégicas**:
- Considerar suporte a mais redes
- Adicionar analytics mais detalhados
- Melhorar ferramentas de debug
- Implementar sistema de logs centralizado

A API Notus demonstra grande potencial e está bem estruturada para uso em produção, necessitando apenas de alguns ajustes para melhorar a experiência do desenvolvedor.
