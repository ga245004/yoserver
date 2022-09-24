"use strict";
html >
    Listing;
of;
$;
{
    relativePath;
}
/title>
    .icon;
{
    display: inline - block;
    width: 1e;
    m;
    height: 1e;
    m;
    margin - right;
    5;
    px;
    background - repeat;
    no - repeat;
}
file - icon;
{
    background - image;
    url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 368.553 368.553' style='enable-background:new 0 0 368.553 368.553;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M239.68,0H42.695v368.553h283.164V86.811L239.68,0z M244.057,25.7l56.288,56.701h-56.288V25.7z M57.695,353.553V15 h171.362v82.401h81.802v256.151H57.695V353.553z'/%3E%3Crect x='86.435' y='82.401' width='121.875' height='15'/%3E%3Crect x='86.435' y='151.122' width='195.685' height='15'/%3E%3Crect x='86.435' y='219.843' width='195.685' height='15'/%3E%3Crect x='86.435' y='288.563' width='195.685' height='15'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A");
}
folder - icon;
{
    background - image;
    url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cpath style='fill:%23FBC176;' d='M0,167.724v264.828c0,15.007,11.476,26.483,26.483,26.483h459.034 c15.007,0,26.483-11.476,26.483-26.483V167.724c0-15.007-11.476-26.483-26.483-26.483H26.483C11.476,141.241,0,153.6,0,167.724'/%3E%3Cpath style='fill:%23C39A6E;' d='M467.862,141.241c0-19.421-15.89-35.31-35.31-35.31H291.31l-44.138-52.966H52.966 c-15.007,0-26.483,12.359-26.483,26.483v61.793H467.862z'/%3E%3Cg%3E%3Cpath style='fill:%23FFFFFF;' d='M158.897,203.034H52.966c-5.297,0-8.828-3.531-8.828-8.828s3.531-8.828,8.828-8.828h105.931 c5.297,0,8.828,3.531,8.828,8.828S164.193,203.034,158.897,203.034'/%3E%3Cpath style='fill:%23FFFFFF;' d='M158.897,238.345H52.966c-5.297,0-8.828-3.531-8.828-8.828s3.531-8.828,8.828-8.828h105.931 c5.297,0,8.828,3.531,8.828,8.828S164.193,238.345,158.897,238.345'/%3E%3C/g%3E%3C/svg%3E%0A");
}
/style>
    < /head>
    < body >
    Listing;
of;
$;
{
    relativePath;
}
/h2>
    < ul;
style = "list-style-type:none" >
    $;
{
    entries.map((entry) => {
        return `<li> <span class="icon ${entry.isDirectory() ? 'folder-icon' : 'file-icon'}"></span><a href="${path.posix.join(relativePath, entry.name)}${entry.isDirectory() ? '/' : ''}">${entry.name}</a></li>\n`;
    }).join('');
}
/ul>
    < /body>
    < /html>;
