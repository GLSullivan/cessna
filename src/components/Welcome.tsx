import React, { useState, useEffect, useRef } from "react";

const Welcome: React.FC = () => {
  const [isOpen, setIsOpen]       = useState(true);             
  const [showDeets, setShowDeets] = useState(false);
  const dialogRef                 = useRef<HTMLDialogElement>(null);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      dialogRef.current?.close();
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  return (
    <>
      <dialog
        ref       = {dialogRef}
        className = {isOpen ? "open" : "closed"}
      >
        <div className = "welcome">
          <h1>Flying The 172</h1>
          <p>
            Welcome! This Three.js project is an exploration of how aircraft are
            controlled in flight. It was created by{" "}
            <span className = "no-wrap">Greg Sullivan</span>, a pilot, developer,
            and animator, as a capabilities demonstration over the course of a
            weekend. 
          </p>
          <p>
            This particular plane is the venerable Cessna 172, Greg's favorite
            plane to fly. Change your view by dragging your mouse. Learn more 
            about the components by clicking on them. Use the arrows and brackets 
            on your keyboard to fly.
          </p>
          <p>Cessna N172GLS, you are cleared for takeoff. Enjoy!</p>
          <div    className = "button-group">
          <button onClick   = {() => setShowDeets(!showDeets)}>
              {showDeets ? "Hide" : "Show"} the technical details.
            </button>
            <button className = "hero-button" onClick = {closeModal}>
              <span>Go Flying!</span>
              <div><i className = "fa-duotone fa-plane-departure"></i></div>
            </button>
          </div>
        </div>
        <div className = {`auto-height ${showDeets ? "open" : ""}`}>
          <div className="sub-block">
            <div>
              <p>
                This project was created using React, TypeScript, and three.js. The
                code, materials, surfacing, rigging, and shaders are by Greg. The
                code is available to explore in my{" "}
                <a
                  href="https://github.com/GLSullivan/cessna"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(e.currentTarget.href, '_blank');
                  }}
                >
                  Git Repo
                </a>
                .
              </p>
              <p>The model was generously contributed by Boba3d, then heavily modified in Blender 3.6.</p>
            </div>
          </div>
        </div>
        </dialog>
        <div onClick={() => { console.log("Clicked!"); setIsOpen(true); }} className="credit-block">
  Created by Greg Sullivan
</div>

    </>
  );
};

export default Welcome;






