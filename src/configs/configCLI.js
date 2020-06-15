const FileFinder = require('../cmds/findFile'),
      Printer = require('../libs/printer'),
      Checker = require('../libs/checker'),
      GotoPath = require('../cmds/gotoPath'),
      LastFound = require('../cmds/lastFound'),
      Programs = require('../cmds/programs'),
      config = require('./config')

const configUnknownCommand = (cli) => {
    // wis error - unknown command entered
    cli._unknownCommand = (cmd) => {
        const printer = new Printer(config.cliColors)
        const checker = new Checker()

        const commands = config.cliCommands

        let thresholds = []
        for (let c of commands) {
            thresholds.push({
                cmd: checker.levenshteinDistance(cmd, c.cmd),
                alias: checker.levenshteinDistance(cmd, c.alias)
            })
        }

        let minIdx = 0
        for (let t in thresholds) {
            if (thresholds[t].cmd < thresholds[minIdx].cmd)
                minIdx = t
        }

        let minThresholdsCommands = []
        for (let t in thresholds) {
            if (thresholds[t].cmd === thresholds[minIdx].cmd) {
                minThresholdsCommands.push({
                    cmd: commands[t].cmd,
                    alias: commands[t].alias,
                    text: commands[t].text
                })
            }
        }

        printer.printSimilarCommands(minThresholdsCommands)
    }

    return cli
}

const configFindFileCommand = (cli) => {
    // wis find|f [options:--strict|-S] <fname> 
    cli.command('find <fname>')  // Command name with props name 
        .description('Search for a file from the current path.')
        .option('-s,--strict', 'Strict finding files.')
        .option('-p, --start-path <path>')
        .alias('f')  // Short name of command
        .action((fname, cmd) => { // Action
            const checker = new Checker()
            const printer = new Printer(config.cliColors)

            if (checker.validateFileName(fname)) {
                const { strict, startPath } = cmd

                let strict_mode = false

                if (strict)
                    strict_mode = true

                if (startPath)
                    if (!checker.validatePath(startPath))
                        printer.printError('Invalid start path')

                const fileFinder = new FileFinder(startPath)

                fileFinder.getSimilarFiles(fname, strict_mode)
            } else {
                printer.printError('Invalid file name')
            }
        })

    return cli
}

const configGetLastFoundFiles = (cli) => {
    // wis last|l
    cli.command('last')  // Command name with props name
        .description('Get last found files.')
        .alias('l')
        .action(() => {
            const lastFound = new LastFound()
            lastFound.get()
        })

    return cli
}

const configGotoPathCommand = (cli) => {
    // wis take|t <id>
    cli.command('goto <id>')
        .description('Go to file path with this id.')
        .option('-w, --withp <program>', 'Open file with program placed in PATH')
        .option('--force', 'To disable the check of finding application in PATH')
        .alias('g')
        .action((id, cmd) => {
            const { withp, force } = cmd
            const printer = new Printer(config.cliColors)
            const programs = new Programs()
            const gotoPath = new GotoPath()

            if (force)
                if (withp)
                    gotoPath.go(id, withp, true)
                else
                    gotoPath.go(id)
            else
                if (withp)
                    if (programs.isPATHProgramExist(withp))
                        gotoPath.go(id, withp, false)
                    else
                        printer.printError(
                            'I don\'t know such a program.' +
                            ' Use --force flag to open without my checks')
                else
                    gotoPath.go(id)
        })

    return cli
}

const configGetPATHPrograms = (cli) => {
    // wis programs|prs
    cli.command('programs')
        .description('Get all programs from PATH.')
        .alias('prs')
        .action(() => {
            const programs = new Programs()
            const printer = new Printer(config.cliColors)
            printer.printPATHPrograms(programs.getPATHPrograms())
        })

    return cli
}

const configGetLastGotoFile = (cli) => {
    // wis lastgoto|lg
    cli.command('lastgoto')
        .description('Get last goto file path.')
        .alias('lg')
        .action(() => {
            const gotoPath = new GotoPath()
            gotoPath.getLastGotoPath()
        })

    return cli
}


const configCLI = (cli) => {
    // wis --version|-V
    // wis --help|-h
    cli.version('1.2.2')
        .description('CLI for finding files.')

    cli = configUnknownCommand(cli)
    cli = configGetLastFoundFiles(cli)
    cli = configFindFileCommand(cli)
    cli = configGotoPathCommand(cli)
    cli = configGetPATHPrograms(cli)
    cli = configGetLastGotoFile(cli)

    return cli
}

module.exports = configCLI
