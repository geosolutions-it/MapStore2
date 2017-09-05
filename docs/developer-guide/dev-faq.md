# FAQ

## Troubleshooting

### Autowatch doesn't work on Linux.
You should need to increase `max_user_watches` variable for inotify.
```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
