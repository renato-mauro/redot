function GraficoDeBarras()
{
    this.width    = 1024;
    this.height   = 200;
    
    /**********************************************************************************************
    <div>
        <svg width="{width+50}" height="{height+50}" style="border: 1px black solid;">
            <g transform="translate(25 25)" style="text-anchor: middle;">
                <include template="Barra" data="{d}" />
            </g>
        </svg>
    </div>
    **********************************************************************************************/
}

function Barra()
{        
    this.color = "skyblue";
    this.width = ~~(1024/50);
    this.height = "{2*d.qtd}";
    this.x = "{i*width}";
    this.y = "{200-height}";
    
    this.select = function(flag)
    {
        d.color = flag ? "orange" : "skyblue";
    }
    
    /*************************************************************************************************************************************
    <g class="bar" style="transform:translate({i*width}px,0);">
        <rect onmouseover="{select(true)}" onmouseout="{select(false)}" x="1" y="{y}" height="{height}" width="{width-2}" fill="{color}"/>
        <text x="{width/2}" y="{y-6}" alignment-baseline="middle">{d.qtd}</text> 
        <text x="{width/2}" y="{y+height}" alignment-baseline="middle">{i}</text>
    </g>
    **************************************************************************************************************************************/
}

var data = [];
for(var i=0; i<48; i++)
{
    data.push({qtd:~~(Math.random()*91)+10});
}
redot.applyTemplate("#main", GraficoDeBarras, data);

var j = 48;
var interval = setInterval(function(){
    data.push({qtd:~~(Math.random()*91)+10});
    j++;
    if(j > 51)
    {
        data.shift();
    }
    redot.changed(data);
},600);

