import { humanReadableDate } from "../../functions/helpers";
import { Tab } from "../styled-components";
import { UserContext } from "../../contexts";
import { createUseStyles } from "react-jss";
import { NavLink } from "react-router-dom";
import React, { useContext } from "react";
import HttpError from "../http/HttpError";
import { useParams } from "react-router";
import { useQuery } from "react-query";
import { mdiLoading } from "@mdi/js";
import { Http } from "../../classes";
import { Posts, Threads } from "./";
import classnames from "classnames";
import { Header } from "../layout";
import Icon from "@mdi/react";

export default function Profile() {
    const styles = createUseStyles({
        container: {
            margin: [50, "var(--container-margin)"],
            "@media (max-width: 768px)": {
                margin: "var(--container-margin)",
            },
        },
        content: {
            minHeight: 200,
        },
        avatar: {
            border: "2px solid black",
            width: 100,
        },
        username: {
            fontFamily: "Merriweather",
            "@media (max-width: 768px)": {
                fontSize: "1.5rem",
            },
        },
        tabs: {
            boxShadow: [0, 0, 5, 0, "rgba(0, 0, 0, 0.05)"],
        },
        tab: {
            fontFamily: " Web !important",
            transform: "none !important",
            padding: 10,
        },
        signature: {
            fontFamily: "Roboto Slab",
            fontSize: "1.15rem",
        },
        meta: {
            marginTop: 50,
            "@media (max-width: 768px)": {
                marginTop: "var(--container-margin)",
            },
        },
        metaContent: {
            "@media (max-width: 768px)": {
                gridTemplateColumns: "repeat(2, 1fr)",
                gridGap: "var(--container-margin)",
                display: "grid",
            },
        },
        metabox: {
            fontFamily: "Titillium Web",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            display: "flex",
            margin: [0, 40],
            "@media (max-width: 768px)": {
                margin: 0,
            },
        },
        metaheader: {
            fontWeight: "normal",
            marginBottom: 10,
            fontSize: "1rem",
            "@media (max-width: 768px)": {
                marginBottom: 0,
            },
        },
        metavalue: {
            fontSize: "1.5rem",
            "@media (max-width: 768px)": {
                fontSize: "1.25rem",
            },
        },
    });
    const classes = styles();

    const { id, tab } = useParams();

    const { data, status } = useQuery(
        `profile-${id}`,
        async () => {
            const { data, code } = await Http.get(`profile/${id}`);
            if (code !== 200) return code;
            return data;
        },
        { retry: false }
    );

    if (data === 404) return <HttpError code={data} />;

    document.title = `TPH | ${id}`;

    const render = () => {
        if (status === "loading") {
            return (
                <Icon
                    className={classnames("loadingWheel-2 center-self")}
                    path={mdiLoading}
                    spin={1}
                />
            );
        }
        return (
            <div className={classnames(classes.container)}>
                <div className={classnames("col center-children")}>
                    <img
                        className={classnames(classes.avatar, "round")}
                        src={`/storage/avatars/${data.avatar}`}
                        alt="Profile avatar"
                    />
                    <h1
                        className={classnames(
                            classes.username,
                            `color-${data.roles[0].clearance}`,
                            "mt-3"
                        )}
                    >
                        {data.username}
                    </h1>
                    {data.signature && (
                        <p className={classnames(classes.signature, "mt-3")}>
                            {data.signature}
                        </p>
                    )}
                </div>
                <div
                    className={classnames(classes.meta, "col center-children")}
                >
                    <div
                        className={classnames(
                            classes.metaContent,
                            "row center-children"
                        )}
                    >
                        <div className={classnames(classes.metabox)}>
                            <h4 className={classnames(classes.metaheader)}>
                                Rank
                            </h4>
                            <h3
                                className={classnames(
                                    classes.metavalue,
                                    "ucfirst"
                                )}
                            >
                                {data.rank}
                            </h3>
                        </div>
                        <div className={classnames(classes.metabox)}>
                            <h4 className={classnames(classes.metaheader)}>
                                Posts
                            </h4>
                            <h3 className={classnames(classes.metavalue)}>
                                {data.postsAmount}
                            </h3>
                        </div>
                        <div className={classnames(classes.metabox)}>
                            <h4 className={classnames(classes.metaheader)}>
                                Reputation
                            </h4>
                            <h3 className={classnames(classes.metavalue)}>
                                {data.likesAmount}
                            </h3>
                        </div>
                        <div className={classnames(classes.metabox)}>
                            <h4 className={classnames(classes.metaheader)}>
                                Joined
                            </h4>
                            <h3 className={classnames(classes.metavalue)}>
                                {humanReadableDate(data.created_at)}
                            </h3>
                        </div>
                    </div>
                </div>
                <nav
                    className={classnames(
                        classes.tabs,
                        "center-children mt-4 mx-auto w-fit"
                    )}
                >
                    <Tab
                        as={NavLink}
                        className={classnames(classes.tab)}
                        to={`/user/${id}/threads`}
                    >
                        Threads
                    </Tab>
                    <Tab
                        as={NavLink}
                        className={classnames(classes.tab)}
                        to={`/user/${id}/posts`}
                    >
                        Posts
                    </Tab>
                </nav>
                <div
                    className={classnames(classes.content, "col py-4 relative")}
                >
                    {tab === "threads" && <Threads />}
                    {tab === "posts" && <Posts />}
                </div>
            </div>
        );
    };

    return (
        <>
            <Header />
            {render()}
        </>
    );
}
