import useOnclickOutside from "react-cool-onclickoutside";
import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import { NavLink } from "react-router-dom";
import classnames from "classnames";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";

export default function NavDropdown({
    containerClassName = "",
    toggler,
    items = [],
    align = "right",
}) {
    const styles = createUseStyles({
        wrapper: {
            position: "relative",
            marginRight: 50,
            display: "flex",
            padding: 10,
            height: 100,
            "&.right": {
                marginRight: 0,
                marginLeft: 50,
            },
            "@media (max-width: 768px)": {
                transition: "all 0.25s",
                marginRight: 25,
                height: "unset",
                padding: 0,
                "&.right": {
                    marginRight: 0,
                    marginLeft: 25,
                },
            },
        },
        toggler: {
            fontSize: "1.25rem",
            background: "none",
            border: 0,
        },
        mobileClose: {
            color: "var(--color-primary)",
            position: "absolute",
            background: "none",
            display: "none",
            border: 0,
            right: 20,
            top: 20,
            "& svg": {
                width: 35,
            },
            "&.show": {
                "@media (max-width: 768px)": {
                    display: "flex",
                    "&:hover": {
                        color: "var(--color-main)",
                    },
                },
            },
        },
        listWrapper: {
            backgroundColor: "var(--color-dark)",
            transform: "translateX(-50%)",
            position: "absolute",
            marginTop: 89,
            left: "50%",
            zIndex: 10,
            "@media (max-width: 768px)": {
                transition: "all 0.25s ease-in-out",
                transform: "none",
                position: "fixed",
                display: "flex",
                height: "100vh",
                width: "100vw",
                marginTop: 0,
                top: "-100%",
                left: 0,
                "&.open": {
                    top: 0,
                },
            },
        },
        list: {
            boxShadow: [0, 0, 5, 0, "black"],
            borderRadius: 4,
            "@media (max-width: 768px)": {
                boxShadow: "none",
                margin: "auto",
                gap: "20px",
            },
        },
        item: {
            color: "var(--color-primary)",
            fontFamily: "Titillium Web",
            textAlign: "center",
            padding: [15, 35],
            "&.active, &:hover": {
                color: "var(--color-main)",
            },
            "&:last-child": {
                borderBottomRightRadius: 2,
                borderBottomLeftRadius: 2,
            },
            "&:hover": {
                textDecoration: "none",
            },
            "@media (max-width: 768px)": {
                background: "none !important",
                color: "var(--color-primary)",
                fontSize: "1.5rem",
                "&:hover": {
                    color: "var(--color-main)",
                },
            },
        },
    });
    const classes = styles();

    const [open, setOpen] = useState(false);

    const wrapper = useOnclickOutside(() => {
        setOpen(false);
    });

    useEffect(() => {
        const body = document.querySelector("body");
        if (window.innerWidth <= 768 && open) {
            body.style.overflow = "hidden";
        } else {
            body.style.overflow = "visible";
        }
    }, [open]);

    return (
        <div
            className={classnames(
                classes.wrapper,
                "no-select",
                align,
                containerClassName
            )}
            ref={wrapper}
        >
            <button
                className={classnames(
                    classes.toggler,
                    "color-main center-children bold"
                )}
                onClick={() => setOpen((p) => !p)}
            >
                {toggler}
            </button>
            <div className={classnames(classes.listWrapper, { open: open })}>
                <button
                    className={classnames(classes.mobileClose, { show: open })}
                    onClick={() => setOpen(false)}
                >
                    <Icon path={mdiClose} />
                </button>
                <ul className={classnames(classes.list, "col")}>
                    {open &&
                        items.length > 0 &&
                        items.map((item) =>
                            item.args?.router === false ? (
                                <a
                                    className={classnames(
                                        classes.item,
                                        "relative bold"
                                    )}
                                    href={`${window.location.origin}${item.to.pathname}`}
                                    onClick={() => setOpen(false)}
                                    key={item.name}
                                >
                                    {item.name}
                                </a>
                            ) : (
                                <NavLink
                                    className={classnames(
                                        classes.item,
                                        "relative bold"
                                    )}
                                    onClick={() => setOpen(false)}
                                    key={item.name}
                                    to={item.to}
                                >
                                    {item.name}
                                </NavLink>
                            )
                        )}
                </ul>
            </div>
        </div>
    );
}
