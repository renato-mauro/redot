var selectedItem = { browserName: "" };

function Grid()
{
    this.width = 500;
    this.height = 500;
    
    /**********************************************************************************
    <div>
        <svg width="{width}" height="{height+60}" style="border: 1px black solid;">
            <g>
                <text class="title" x="{width/2}" y="25">Web Browser Usage From January 2015 to April 2016</text>
                <text class="subtitle" x="{width/2}" y="50">{selectedItem.browserName}</text>
                </g>
            <g transform="translate(0 60)">
                <include template="{GridRows}" data="{d}" />
            </g>
        </svg>
    </div>
    **********************************************************************************/
}

function GridRows()
{
    this.rowHeight = "{parent.height/parent.d.length}";
    this.colWidth = "{parent.width/d.length}";

    /**********************************************************************************
    <g transform="translate(0 {rowHeight*i})">
        <include template="{PieChart}" data="{d}" />
    </g>
    **********************************************************************************/
}

// PieChart Template
function PieChart()
{
    this.width    = "{parent.colWidth}";
    this.height   = "{parent.rowHeight}";
    this.radius   = "{width*0.30}";
    this.value    = 0;

    /**********************************************************************************
    <g transform="translate({width*i} 0)">
        <text x="{width/2}" y="14">
            {d.Date}
        </text>
        <g transform="translate({width/2} {height/2})">
            <include template="{PieSlice}" data="{d.elements}" />
        </g>
        <g transform="translate({width/2} {height-10})">
            <text>
                {selectedItem.browserName == '' ? '' : redot.format.percent(value)}
            </text>
        </g>
    </g>
    ********************************************************************************/
}

function color(browserName)
{
    switch(browserName)
    {
        case "Internet Explorer": return "#D95B43";
        case "Firefox": return "#C02942";
        case "Google Chrome": return "#ECD078";
        case "Safari": return "#53777A";
        case "Opera": return "#542437";
        default: return "#c0c0c0";
    }
}

// PieSlice Template
function PieSlice()
{
    this.pieRange = redot.stack("{d.value}");
    this.sliceClass = "{selectedItem.browserName == d.name ? redot.last(parent.value=d.value, 'selected') : 'notSelected'}";

    this.sel = function(d)
    {
        if(selectedItem.browserName == d.name)
        {
            selectedItem.browserName = "";
        }
        else
        {
            selectedItem.browserName = d.name;
        }
    }

    /*****************************************************
    <path 
        class="{sliceClass}" 
        onclick="{sel(d)}" 
        d="{redot.path.pieSlice(parent.radius,pieRange)}" 
        stroke="black" 
        fill="{color(d.name)}"
    />
    ******************************************************/
}

redot.applyTemplate("#main", Grid, redot.json("http://renato-mauro.github.io/redot/data/BrowserUsageGrid4Cols.json"));