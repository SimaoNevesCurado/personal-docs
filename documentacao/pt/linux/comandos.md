# Comandos Linux

Referência rápida para tarefas comuns no terminal. Consulta as opções de cada comando com `man <comando>` antes de o usar em ficheiros importantes.

| Tarefa | Comando |
| --- | --- |
| Ver a pasta atual | `pwd` |
| Listar ficheiros, incluindo os ocultos | `ls -la` |
| Mudar de pasta | `cd /caminho/para/pasta` |
| Criar uma pasta | `mkdir -p pasta` |
| Copiar um ficheiro | `cp origem destino` |
| Mover ou renomear um ficheiro | `mv origem destino` |
| Procurar ficheiros pelo nome | `find . -name '*.log'` |
| Procurar texto em ficheiros | `grep -R 'texto' pasta` |
| Ver espaço em disco | `df -h` |
| Ver o tamanho de uma pasta | `du -sh pasta` |
| Ver processos em execução | `ps aux` |
| Acompanhar um ficheiro de log | `tail -f aplicacao.log` |

Usa `sudo` apenas quando o comando precisa de permissões de administrador. Confirma os caminhos antes de usar `rm` ou alterar permissões.
