```
       _      _ _
      | |    | | |
      | | ___| | |_   _
  _   | |/ _ \ | | | | |
 | |__| |  __/ | | |_| |
  \____/ \___|_|_|\__, |
                   __/ |
                  |___/
```

Jelly is a high level CDK construct that defines everything you'll need to deploy a JAMstack application.

## Usage

Check out the [Jelly README][0] for a full API breakdown.

This package contains an example application that leverages Jelly.
Check out the [API][1], [client][2], and [infrastructure][3].

[0]: jelly/README.md
[1]: example/api
[2]: example/app
[3]: example/infrastructure

## Roadmap

### Housekeeping

- Testing
- Update documentation

### Enhancements

- Dashboards, alarms, pipeline tests, etc.
- Migrate to monocdk (v2)

## Troubleshooting

Well, this isn't helpful.

## Development

This project leverages [Rush][4] to manage its monorepo. You'll need to install Rush globally to get started.

```bash
npm install -g @microsoft/rush
```

[4]: https://rushjs.io/

### Common Commands

`rush update` - Installs all dependencies for the monorepo

`rush update-cdk` - Upgrades all CDK packages to the latest version

`rush rebuild` - Does a full, clean build of every project
(run `rush build` to build only the projects that have changed)

`rush add -p PACKAGE` - Adds the specified package as a dependency of the current project
(use `--dev` to make it a dev dependency)

`rush purge` - Deletes all temporary files created by Rush
(useful if you are having problems and suspect that cache files may be corrupt)