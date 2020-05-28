const DataWorker = require('../data/dataWorker'),
    Printer = require('../libs/printer'),
    config = require('../app/config')

class GotoPath {
    constructor() {
        this.dataList = config.dataList
    }

    go(id) {
        const dataWorker = new DataWorker()
        const printer = new Printer(config.fileListColors)

        this.dataList = dataWorker.getData()

        if (this.dataList.file_list_has_updated) {
            const files = this.dataList.file_list
            if (id >= 0 && id <= files.length - 1) {
                console.log(files[id].join(''))
                this.dataList = {
                    file_list: files,
                    file_list_has_updated: false
                }
                dataWorker.setData(this.dataList)
            } else {
                printer.printError('Invalid file ID from the list')
            }
        } else {
            printer.printWarning('You should update file list', 'Use <wis find|f> command to find files')
        }

    }
}

module.exports = GotoPath