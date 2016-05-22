function GraficoDeBarras(d)
{
    d.width    = 1024;
    d.height   = 200;
    
    d.ordenaAsc = function()
    {
        d.sort(function(a,b){return a.qtd-b.qtd});
        dvl.fireArrayChange(d);
    }

    d.ordenaDesc = function()
    {
        d.sort(function(a,b){return b.qtd-a.qtd});
        dvl.fireArrayChange(d);
    }

    d.ordenaOriginal = function()
    {
        d.sort(function(a,b){return a.original-b.original});
        dvl.fireArrayChange(d);
    }
    
    d.embaralha = function()
    {
        var j, aux;
        for (var i = d.length; i; i -= 1) 
        {
            j = Math.floor(Math.random() * i);
            aux = d[i - 1];
            d[i - 1] = d[j];
            d[j] = aux;
        }
        dvl.fireArrayChange(d);
    }
    
    this.txt = "Passa o mouse";
    
    /**********************************************************************************************
    <template>
        <div>{this.txt}</div>
        <div>
            <svg width="{d.width+50}" height="{d.height+50}" style="border: 1px black solid;">
                <g transform="translate(25 25)" style="text-anchor: middle;">
                    <include template="Barra" data="{d}" />
                </g>
            </svg>
        </div>
        <div>
            <button onclick="{d.ordenaAsc()}">Crescente</button>
            <button onclick="{d.ordenaDesc()}">Descrescente</button>
            <button onclick="{d.ordenaOriginal()}">Original</button>
            <button onclick="{d.embaralha()}">Embaralha</button>
        </div>
        
    </template>
    **********************************************************************************************/
}

function Barra(d, i)
{    
    d.color = "skyblue";
    d.width = 1024/50;
    d.height = 2*d.qtd;
    d.x = i*d.width;
    d.y = 200-d.height;
    
    var that = this;
    
    d.select = function(flag)
    {
        that.parent.txt = i + ", " + d.qtd;
        d.color = flag ? "orange" : "skyblue";
    }
    
    /**********************************************************************************************
    <template>
        
        <g class="bar" style="transform:translate({i*d.width}px,0);">
            <rect onmouseover="{d.select(true)}" onmouseout="{d.select(false)}" x="1" y="{200-2*d.qtd}" height="{2*d.qtd}" width="{d.width-2}" fill="{d.color}"/>
            <text x="{d.width/2}" y="{200-2*d.qtd-6}" alignment-baseline="middle">{d.qtd}</text> 
        </g>
    </template>
    **********************************************************************************************/
}

function main()
{
    var data = [];
    for(var i=0; i<50; i++)
    {
        data.push({qtd:~~(Math.random()*91)+10,original:i});
    }
    dvl.applyTemplate("#main", GraficoDeBarras, data);
}
