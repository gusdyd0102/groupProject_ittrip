import React, { useState, useEffect } from "react";
import "../css/Modal.css";
import { useMediaQuery } from "react-responsive";

const Modal = ({ isOpen, onClose, title, content, actions, className }) => {
    const [isVisible, setIsVisible] = useState(false);
    const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });
    const isTablet = useMediaQuery({ query: "(min-width: 431px) and (max-width: 1024px)" });
    const isMobile = useMediaQuery({ query: "(max-width: 430px)" });

    useEffect(() => {
        if (isOpen) { setIsVisible(true);}
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 700); 
    };

    return (
        <div className={`modal-backdrop ${isOpen ? "open" : ""} ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}`}>
            <div className={`modal-content ${isOpen ? "open" : ""} ${className || ""} ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}`}
                onTransitionEnd={() => {
                    if (!isOpen) setIsVisible(false);
                }}
                style={{ display: isVisible ? "flex" : "none" }}
            >
                {title && <h2 className="modal-title">{title}</h2>}
                <div className="modal-body">
                    {typeof content === "string" ? <p>{content}</p> : content}
                </div>
                <div className="modal-actions">
                    {actions?.map((action, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={action.onClick}
                            className={action.className || "modal-button"}
                        >
                            {action.label}
                        </button>
                    ))}
                    {!actions?.length && (
                        <button className="default-close" onClick={handleClose}>
                            확인
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
