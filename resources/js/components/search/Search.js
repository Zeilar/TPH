import { errorCodeHandler } from "../../functions/helpers";
import { FeedbackModalContext } from "../../contexts";
import { useHistory, useParams } from "react-router";
import React, { useContext, useState } from "react";
import { ucfirst } from "../../functions/helpers";
import { Http, Validator } from "../../classes";
import { createUseStyles } from "react-jss";
import { Users, Threads, Posts } from "./";
import { NavLink } from "react-router-dom";
import { Tab } from "../styled-components";
import { useQuery } from "react-query";
import { mdiLoading } from "@mdi/js";
import { Searchbar } from "../misc";
import classnames from "classnames";
import { Header } from "../layout";
import Icon from "@mdi/react";

export default function Search() {
    const styles = createUseStyles({
        container: {
            margin: [0, "var(--container-margin)"],
        },
        query: {
            backgroundImage: "var(--color-main-gradient)",
            color: "var(--color-primary)",
            borderRadius: 4,
        },
        header: {
            fontFamily: "Merriweather",
        },
        tab: {
            fontFamily: "Titillium Web !important",
        },
        inputError: {
            color: "var(--color-danger)",
        },
    });
    const classes = styles();

    const { setMessage } = useContext(FeedbackModalContext);
    const [inputError, setInputError] = useState();
    const { query, tab, page } = useParams();
    const history = useHistory();

    document.title = `TPH | ${query ?? "Search"} ${
        tab ? "- " + ucfirst(tab) : ""
    }`;

    const { data, status } = useQuery(
        [page ?? "1", `search-${query}`],
        async () => {
            if (!query) return;
            setInputError(false);
            const { data, code } = await Http.get(
                `search?q=${query}&page=${page ?? "1"}`
            );
            errorCodeHandler(code, (message) => setMessage(message));
            return data;
        },
        { retry: false }
    );

    function search(e, input) {
        e.preventDefault();
        const results = new Validator(input, "search")
            .required()
            .min(3)
            .max(50);
        if (results.errors.length > 0) {
            return setInputError(results.errors[0]);
        }
        history.push(`/search/${input}`);
    }

    return (
        <>
            <Header />
            <div className={classnames(classes.container, "col my-4")}>
                <h2 className={classnames(classes.header, "mb-1")}>Search</h2>
                <Searchbar defaultValue={query} onSubmit={search} />
                {inputError && (
                    <p
                        className={classnames(classes.inputError, "mt-1")}
                        dangerouslySetInnerHTML={{ __html: inputError }}
                    />
                )}
                <div className={classnames("row mt-2 py-2")}>
                    {status === "loading" && (
                        <Icon
                            className={classnames(
                                "color-main center-self loadingWheel-2"
                            )}
                            path={mdiLoading}
                            spin={1}
                        />
                    )}
                    {status === "success" && data && (
                        <>
                            <Tab
                                className={classnames(classes.tab)}
                                as={NavLink}
                                to={`/search/${query}/users`}
                            >
                                Users ({data.users.total})
                            </Tab>
                            <Tab
                                className={classnames(classes.tab)}
                                as={NavLink}
                                to={`/search/${query}/threads`}
                            >
                                Threads ({data.threads.total})
                            </Tab>
                            <Tab
                                className={classnames(classes.tab)}
                                as={NavLink}
                                to={`/search/${query}/posts`}
                            >
                                Posts ({data.posts.total})
                            </Tab>
                        </>
                    )}
                </div>
                <div className={classnames("col")}>
                    {tab === "users" && status === "success" && data && (
                        <Users data={data.users} />
                    )}
                    {tab === "threads" && status === "success" && data && (
                        <Threads data={data.threads} />
                    )}
                    {tab === "posts" && status === "success" && data && (
                        <Posts data={data.posts} />
                    )}
                </div>
            </div>
        </>
    );
}
