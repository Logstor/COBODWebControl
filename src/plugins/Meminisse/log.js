export class Log 
{
    /**
     * Constructs a Log instance.
     * 
     * @param {String} filename Name of the GCode file which is being printed.
     * @param {Date} date The start date of this print log - just use Date.now()
     * @param {Array<String>} headerList An array of Strings for the header of the CSV file.
     */
    constructor(filename, date, headerList) 
    {
        // Initialize metadata
        this._filename = filename;
        this._date = date;
        this._headerList = headerList;
        this._buffer = new Array();

        this._addHeader();
    }

    /**
     * Adds the header as the first line
     */
    _addHeader() 
    {
        // Check for errors
        let size = this._headerList.length;
        for (let i=0; i < size; ++i)
        {
            if (this._headerList[i].search('\n') != -1)
                throw "Headers shouldn't contain newline characters!";
        }

        // Add
        this._buffer.push(this._headerList);
    }

    /**
     * Adds a new entry to the csv log.
     * 
     * Make sure there's an element to every header, otherwise it throws.
     * 
     * @param {} dataList 
     */
    addEntry(dataList)
    {
        // Make sure length fits
        if (dataList.length != this._headerList.length)
            throw "New entry doesn't contain the correct amount of data points!";

        // Make sure we don't have newline characters
        for (let string in dataList)
        {
            if (string.search('\n') != -1)
                throw "Data points shouldn't contain newlines!";
        }

        // Add to buffer
        this._buffer.push(dataList);
    }

    /**
     * Creates a blob in CSV format.
     * 
     * @returns URI
     */
    createBlob()
    {
        let csvContent = "data:text/csv;charset=utf-8,";

        let entryCount = this._headerList.length;
        let rows = this._buffer.length;
        for (let i=0; i < rows; ++i)
        {
            let row = this._buffer[i];
            for (let j=0; j < entryCount; ++j)
            {
                csvContent += row[j] + ",";
            }
            csvContent += "\r\n";
        }
        return encodeURI(csvContent);
    }

    get filename() { return this._filename; }
    get date() { return this._date; }
    get headers() { return this._headerList; }
    get dataPointCount() { return this._headerList.length; }
}