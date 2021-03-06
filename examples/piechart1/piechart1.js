var data =     
{
    "date": "April 2016",
    "elements": [
        { "name": "Internet Explorer", value: 0.096, color: "#D95B43" },
        { "name": "Firefox", value: 0.097, color: "#C02942"  },
        { "name": "Google Chrome", value: 0.572, color: "#ECD078" },
        { "name": "Safari", value: 0.134, color: "#53777A" },
        { "name": "Opera", value: 0.041, color: "#542437" },
        { "name": "Other", value: 0.06, color: "#535353" }
    ]
};

// PieChart Template
function PieChart()
{
    this.width    = 400; // define width of client area
    this.height   = 400; // define height of client area
    this.radius   = "{width*0.30}";
    this.count    = "{d.elements.length}";

    /**********************************************************************************
    <div>
        <svg width="{width}" height="{height}" style="border: 1px black solid;">
            <text class="title" style="" x="{width/2}" y="40">
                {d.date}
            </text>
            <g transform="translate({width/2} {height/2})">
                <include template="{PieSlice}" data="{d.elements}" />
            </g>
            <g transform="translate(0 {height-16*count})">
                <include template="{Legend}" data="{d.elements}" />
            </g>
        </svg>
    </div>
    ********************************************************************************/
}

// PieSlice Template
function PieSlice()
{
    this.pieRange = redot.stack("{d.value}");

    /***********************************************************************************
    <path d="{redot.path.pieSlice(parent.radius,pieRange)}" stroke="black" fill="{d.color}"/>
    <text class="pietext" transform="{redot.centroid.pieSlice(parent.radius,pieRange)}">
        {redot.format.percent(d.value)}
    </text>
    ***********************************************************************************/
}

// Legend Template
function Legend()
{
    this.x = 5;
    this.y = "{i*16-5}";

    /***********************************************************************************
    <g transform="translate({x} {y})">
        <circle r="5" cx="8" cy="8" fill="{d.color}"/>
        <text class="legend" x="16" y="8">{d.name}</text>
    </g>
    ***********************************************************************************/
}

redot.applyTemplate("#main", PieChart, data);        
