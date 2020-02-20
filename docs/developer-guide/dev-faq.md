# FAQ

## Troubleshooting

### Autowatch doesn't work on Linux.
You should need to increase `max_user_watches` variable for inotify.

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

# Other References

* [How to use a CDN](../how-to-use-a-cdn)
