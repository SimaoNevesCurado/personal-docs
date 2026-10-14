# Linux commands

Quick reference for common terminal tasks. Check a command's options with `man <command>` before using it on important files.

| Task | Command |
| --- | --- |
| Show current directory | `pwd` |
| List files, including hidden files | `ls -la` |
| Change directory | `cd /path/to/directory` |
| Create a directory | `mkdir -p directory` |
| Copy a file | `cp source destination` |
| Move or rename a file | `mv source destination` |
| Find files by name | `find . -name '*.log'` |
| Search text in files | `grep -R 'text' directory` |
| Show disk space | `df -h` |
| Show directory size | `du -sh directory` |
| Show running processes | `ps aux` |
| Follow a log file | `tail -f application.log` |

Use `sudo` only when a command needs administrator privileges. Review paths carefully before using `rm` or changing permissions.
