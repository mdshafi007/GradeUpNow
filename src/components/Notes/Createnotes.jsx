import React from "react";

const Createnotes=({inputText, setInputText, saveHandler})=>{
    const char=200;
    const charlimit=char-inputText.length;
    return(
        <div className="note">
           <textarea 
           cols={10} 
           rows={5} 
           placeholder="Write here..." 
           value={inputText}
           onChange={(e)=>setInputText(e.target.value)}
           
           char={200}>

           </textarea>
           <div className="notefooter">
            <span className="label">{charlimit} Left</span>
            <button className="notesave" onClick={saveHandler}>Save</button>
           </div>
        </div>
    )
}

export default Createnotes; 