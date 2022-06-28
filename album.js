(function (){
    let saveButton=document.querySelector("#saveAlbum");
    let addAlbum = document.querySelector("#addAlbum");
    let deleteAlbum = document.querySelector("#deleteAlbum");
    let importAlbum = document.querySelector("#importAlbum");
    let exportAlbum = document.querySelector("#exportAlbum");
    let playAlbum = document.querySelector("#playAlbum");
    let uplaodFile=document.querySelector("#uploadFile");

    let selectAlbum = document.querySelector("#selectAlbum");
    let allTemplates = document.querySelector("#allTemplates");

    let overlay=document.querySelector("#overlay");
    let playOverlay=document.querySelector("#play-overlay");

    let contentDetailsOverlay=document.querySelector("#content-details-overlay");

    let newSlide = document.querySelector("#new-slide");
    let createSlide = document.querySelector("#create-slide");
    let showSlide = document.querySelector("#show-slide");
    let slideList=document.querySelector("#slide-list");

    let textImageURL=document.querySelector("#textSlideImage");
    let textTitle=document.querySelector("#textSlideTitle");
    let textDesc=document.querySelector("#textSlideDesc");
    let saveImage=document.querySelector("#saveSlide");

    let albums = [];
    

    addAlbum.addEventListener("click", handleAlbum);
    selectAlbum.addEventListener("change",handleSelectedAlbumOption);
    newSlide.addEventListener("click", handleNewSlideClick);
    saveImage.addEventListener("click",handleSaveSlide);
    saveButton.addEventListener("click", saveToLocalStorage);
    deleteAlbum.addEventListener("click",deleteAlbumFunction);
    exportAlbum.addEventListener("click", handleExportAlbum);
    importAlbum.addEventListener("click", function(){
        uplaodFile.click();
    });
    uplaodFile.addEventListener("change",handleImportAlbum);
    playAlbum.addEventListener("click",handlePlayAlbum);

    function handleImportAlbum(){
        if(selectAlbum.value == "-1"){
            alert("Select an album to import data");
            return;
        }

        let file = window.event.target.files[0]; 
        let reader = new FileReader();
        reader.addEventListener("load",function(){
            let data=window.event.target.result;
            let importedAlbum=JSON.parse(data);


            let album=albums.find(a=>a.name==selectAlbum.value);
            album.slides=album.slides.concat(importedAlbum.slides);

            slideList.innerHTML="";
            for(let i=0;i<album.slides.length;i++){
                let slideTemplate=allTemplates.content.querySelector(".slide");
                let slide=document.importNode(slideTemplate,true);

                slide.querySelector(".title").innerHTML=album.slides[i].title;
                slide.querySelector(".desc").innerHTML=album.slides[i].desc;
                slide.querySelector("img").setAttribute("src",album.slides[i].url);

                slide.addEventListener("click",handleSlideClick);

                album.slides[i].selected = false;

                slideList.append(slide);
            }


        });
        reader.readAsText(file);
    }

    function handleExportAlbum(){
        if(selectAlbum.value == "-1"){
            alert("Select an album to export");
            return;
        }

        let album = albums.find(a => a.name == selectAlbum.value);
        let ajson = JSON.stringify(album);
        let encodedJson = encodeURIComponent(ajson);

        let a =document.createElement("a");
        a.setAttribute("download",album.name+".json");
        a.setAttribute("href", "data:text/json; charset=utf-8, " + encodedJson);

        a.click();
    }

    function handlePlayAlbum(){
        if(selectAlbum.value=="-1"){
            alert("Select an album to Play");
            return;
        }
        playOverlay.style.display = "block";
        playOverlay.querySelector("#text").innerHTML = "Playing Album..";

        let album = albums.find(a => a.name == selectAlbum.value);
        let i = 0;
        let id=setInterval(function(){
            if(i<album.slides.length){
                slideList.children[i].click();
                playOverlay.querySelector("#text").innerHTML = "Showing slide"+(i+1);    
                i++;
            }else if(i == album.slides.length){
                clearInterval(id);
                playOverlay.style.display = "none";
            }
        },1000);
    }

    function handleAlbum(){
        let albumName = prompt("Enter a name for the new album");
        if(albumName == null){
            return;
        }

        albumName = albumName.trim();
        if(!albumName){
            alert("Empty name not allowed");
            return;
        }

        let exists = albums.some(a => a.name == albumName);
        if(exists){
            alert(albumName + " already exists. Please use a unique new name");
            return;
        }

        let album = {
            name: albumName,
            slides: []
        };
        albums.push(album);
        //adding album name in option dropdown in action bar

        let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
        let newAlbumOption = document.importNode(optionTemplate, true);

        newAlbumOption.setAttribute("value", albumName);
        newAlbumOption.innerHTML=albumName;
        selectAlbum.appendChild(newAlbumOption);

        //the below thing is added because after adding the album the selected album shouls get selected in the dropdown and immediately the overlay should be removed.

        selectAlbum.value=albumName;
        selectAlbum.dispatchEvent(new Event("change"));

    }
    function handleSelectedAlbumOption(){
        if(this.value=="-1"){
            overlay.style.display="block";
            createSlide.style.display="none";
            contentDetailsOverlay.style.display="none";
            showSlide.style.display="none";
        }else{
            overlay.style.display="none";
            contentDetailsOverlay.style.display="block";
            createSlide.style.display="none";
            showSlide.style.display="none";

            let album=albums.find(a=>a.name==selectAlbum.value);
            

            slideList.innerHTML="";
            for(let i=0;i<album.slides.length;i++){
                let slideTemplate=allTemplates.content.querySelector(".slide");
                let slide=document.importNode(slideTemplate,true);

                slide.querySelector(".title").innerHTML=album.slides[i].title;
                slide.querySelector(".desc").innerHTML=album.slides[i].desc;
                slide.querySelector("img").setAttribute("src",album.slides[i].url);

                slide.addEventListener("click",handleSlideClick);

                album.slides[i].selected = false;

                slideList.append(slide);
            }

        }
        

    }

    function handleNewSlideClick(){
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display="none";

        textTitle.value="";
        textDesc.value="";
        textImageURL.value="";

        saveImage.setAttribute("purpose","create");
    }

    function handleSaveSlide(){
        let url=textImageURL.value;
        let title=textTitle.value;
        let desc=textDesc.value;

        if(this.getAttribute("purpose")=="create"){

        let slideTemplate=allTemplates.content.querySelector(".slide");
        let slide=document.importNode(slideTemplate,true);

        slide.querySelector(".title").innerHTML=title;
        slide.querySelector(".desc").innerHTML=desc;
        slide.querySelector("img").setAttribute("src",url);

        slide.addEventListener("click", handleSlideClick);


        slideList.append(slide);
        slide.dispatchEvent(new Event("click"));

        let album=albums.find(a=>a.name==selectAlbum.value);
        //slides  is the array property present in albums array
        album.slides.push({
            title: title,
            url: url,
            desc: desc
        });

        slide.dispatchEvent(new Event("click"));
        }
        else{
            let album=albums.find(a=>a.name==selectAlbum.value);
            let slideToUpdate = album.slides.find(s => s.selected == true);

            let slideDivToUpdate;
            for(let i = 0; i < slideList.children.length; i++){
                let slideDiv = slideList.children[i];
                if(slideDiv.querySelector(".title").innerHTML == slideToUpdate.title){
                    slideDivToUpdate = slideDiv;
                    break;
                }
            }

            //to make changes in slideshow.left part
            slideDivToUpdate.querySelector(".title").innerHTML=title;
            slideDivToUpdate.querySelector(".desc").innerHTML=desc;
            slideDivToUpdate.querySelector("img").setAttribute("src",url);
            
            //to make changes in original content.
            slideToUpdate.url=url;
            slideToUpdate.desc=desc;
            slideToUpdate.title=title;

            slideDivToUpdate.dispatchEvent(new Event("click"));
        }

    }
    function deleteAlbumFunction(){
        if(selectAlbum.value==-1){
            alert("Please select an album");
            return;
        }
        let aidx=albums.findIndex(a=>a.name==selectAlbum.value);
        let album=albums.find(a=>a.name==selectAlbum.value);
        albums.splice(aidx,1);

        selectAlbum.remove(selectAlbum.selectedIndex);

        // currently i am not able to clear elements form slideList.second album image is not getting deleted.tried but didnt get anything

        // slideList.removeChild(slideList.children);

        selectAlbum.value = "-1";
        selectAlbum.dispatchEvent(new Event("change"));

    }


    function handleSlideClick(){
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "none";
        showSlide.style.display="block";
        showSlide.innerHTML="";

        let slideInViewTemplate=allTemplates.content.querySelector(".slide-in-view");
        let slideInView=document.importNode(slideInViewTemplate,true);

        slideInView.querySelector(".title").innerHTML=this.querySelector(".title").innerHTML;
        slideInView.querySelector(".desc").innerHTML=this.querySelector(".desc").innerHTML;;
        slideInView.querySelector("img").setAttribute("src",this.querySelector("img").getAttribute("src"));
        slideInView.querySelector("[purpose=edit]").addEventListener("click", handleEditSlideClick);
        slideInView.querySelector("[purpose=delete]").addEventListener("click", handleDeleteSlideClick);

        showSlide.append(slideInView);

        let album=albums.find(a=>a.name==selectAlbum.value);
        for(let i=0;i<album.slides.length;i++){
            if(album.slides[i].title==this.querySelector(".title").innerHTML){
                album.slides[i].selected=true;

            }else{
                album.slides[i].selected=false;
            }
        }

    }

    function handleEditSlideClick(){
        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "none";
        createSlide.style.display = "block";
        showSlide.style.display="none";

        let album=albums.find(a=>a.name==selectAlbum.value);
        let slide=album.slides.find(a=>a.selected==true);

        textTitle.value=slide.title;
        textDesc.value=slide.desc;
        textImageURL.value=slide.url;

        saveImage.setAttribute("purpose","update");



    }
    function handleDeleteSlideClick(){
        let album=albums.find(a=>a.name==selectAlbum.value);
        let sidx=album.slides.findIndex(a=>a.selected==true);

        let slideDivTBD;
        for(let i=0;i<slideList.children.length;i++){
            let slideDiv=slideList.children[i];
            if(slideDiv.querySelector(".title").innerHTML==album.slides[sidx].title){
                slideDivTBD=slideDiv;
                break;
            }
        }
        slideList.removeChild(slideDivTBD);

        album.slides.splice(sidx,1);

        overlay.style.display = "none";
        contentDetailsOverlay.style.display = "block";
        createSlide.style.display = "none";
        showSlide.style.display="none";

    }
    function saveToLocalStorage(){
        let json = JSON.stringify(albums); // used to convert jso to a json string which can be saved
        localStorage.setItem("data", json);
   
    }
    function loadDataFromStorage(){
        let json = localStorage.getItem("data");
        if(!json){
            return;
        }
       
        albums = JSON.parse(json);
        for(let i = 0; i < albums.length; i++){
            let optionTemplate = allTemplates.content.querySelector("[purpose=new-album]");
            let newAlbumOption = document.importNode(optionTemplate, true);
    
            newAlbumOption.setAttribute("value", albums[i].name);
            newAlbumOption.innerHTML = albums[i].name;
            selectAlbum.appendChild(newAlbumOption);
        }

        selectAlbum.value = "-1";
   

    }
    loadDataFromStorage();

})();