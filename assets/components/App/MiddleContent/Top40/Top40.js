import React, {Component} from 'react';
import {
    Avatar,
    Badge, Button, ButtonGroup,
    Card, CardActionArea,
    CardActions, CardContent,
    IconButton, ListItemAvatar,
    Paper,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@material-ui/core";
import {ArrowDropDown, ArrowDropUp, Favorite} from "@material-ui/icons";
import {withRouter} from "react-router-dom";
import axios from "axios";

class Top40 extends Component {
    state = {
        tops: [],
        topsOld: [],
        topsNew: [],
        topsDisq: [],
        availableVotes: 15,
        canUserVote: false
    }

    componentDidMount() {
        this.getTops();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.auth.token === null && this.props.auth.token) {
            this.getTops();
        }
    }

    getTops() {
        let headers = {};

        if (this.props.auth.token) {
            headers = {
                headers: {
                    Authorization: 'Bearer ' + this.props.auth.token
                }
            }
        }

        axios.get('/api/top40', headers)
            .then(response => {
                this.setState({
                    tops: response.data.tops,
                    topsOld: response.data.topsOld,
                    topsNew: response.data.topsNew,
                    topsDisq: response.data.topsDisq,
                    canUserVote: response.data.canUserVote
                });
            })
            .catch(error => {
                console.log(error);
            })
    }

    decrementVote(id) {
        let tops = this.state.tops;
        let top = this.state.tops.find(top => top.id === id);

        if (top.difference <= 0) {
            return;
        }

        top.difference--;
        top.likes--;

        const newAvailableVotes = this.state.availableVotes + 1;

        this.setState({
            tops: tops,
            availableVotes: newAvailableVotes
        });
    }

    incrementVote(id) {
        let tops = this.state.tops;
        let top = this.state.tops.find(top => top.id === id);

        if (top.difference >= 5) {
            return;
        }

        top.difference++;
        top.likes++;

        const newAvailableVotes = this.state.availableVotes - 1;

        this.setState({
            tops: tops,
            availableVotes: newAvailableVotes
        });
    }

    canYouDecrementHandler(top) {
        // jeigu return true, reiskia negalima

        if (!this.state.canUserVote) {
            return true;
        }

        if (top.difference === 0) {
            return true;
        }

        return false;
    }

    canYouIncrementHandler(top) {
        // jeigu return true, reiskia negalima

        if (!this.state.canUserVote) {
            return true;
        }

        if (this.state.availableVotes === 0) {
            return true;
        }

        if (top.difference === 5) {
            return true;
        }

        return false;
    }

    submitVoteHandler() {
        let tops = this.state.tops.filter(top => top.difference > 0);

        const headers = {
            headers: {
                Authorization: 'Bearer ' + this.props.auth.token
            }
        }

        axios.post('/api/top40', tops, headers)
            .then(response => {
                console.log(response.data);
                this.setState({
                    tops: response.data.tops,
                    topsOld: response.data.topsOld,
                    topsNew: response.data.topsNew,
                    topsDisq: response.data.topsDisq,
                    canUserVote: response.data.canUserVote,
                    availableVotes: 15
                });
            })
            .catch(error => {
                console.log(error);
            })
    }

    redirectToPerformerHandlerWithEvent(event, title, id) {
        event.preventDefault();
        this.redirectToPerformerHandler(title, id);
    }

    redirectToPerformerHandler(title, id) {
        this.props.history.push('/grupe/' + title + '/' + id);
    }

    render() {
        return (
            <Card>
                <CardContent>
                    <h1 align={'center'}>Music.lt TOP40</h1>
                    <TableContainer component={Paper}>
                        <Table aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Vieta</TableCell>
                                    <TableCell />
                                    <TableCell>Atlikėjas / Grupė</TableCell>
                                    <TableCell>Daina</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.topsOld.map((top) => (
                                    <TableRow key={top.id}>
                                        <TableCell component="th" scope="row">
                                            <b>
                                                {top.place <= 40 ?
                                                    <React.Fragment>
                                                        {top.place}
                                                    </React.Fragment>
                                                    :
                                                    'Iškritusi daina'
                                                }
                                                {top.new ?
                                                    ' (Naujiena)'
                                                    :
                                                    <React.Fragment>
                                                        {top.place === top.lastWeekPlace ?
                                                            null
                                                            :
                                                            <React.Fragment>
                                                                {top.place < top.lastWeekPlace ?
                                                                    <React.Fragment>
                                                                        <ArrowDropUp style={{fill: "green"}} />
                                                                        <span>+{top.lastWeekPlace - top.place}</span>
                                                                    </React.Fragment>
                                                                    :
                                                                    <React.Fragment>
                                                                        <ArrowDropDown style={{fill: "red"}} />
                                                                        <span>{top.lastWeekPlace - top.place}</span>
                                                                    </React.Fragment>
                                                                }
                                                            </React.Fragment>
                                                        }
                                                    </React.Fragment>
                                                }
                                            </b>
                                        </TableCell>
                                        <TableCell>
                                            <Avatar>
                                                {top.performerImage ?
                                                    <CardActionArea onClick={() => this.redirectToPerformerHandler(top.performer, top.performerId)}>
                                                        <img style={{maxWidth: '100%'}} src={"/images/groups/" + top.performerImage} alt={top.performer + ' nuotrauka'} />
                                                    </CardActionArea>
                                                    :
                                                    null
                                                }
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            {top.performer === '-' ?
                                                '-'
                                                :
                                                <a
                                                    href={'/grupe/' + top.performer + '/' + top.performerId}
                                                    onClick={(event) => this.redirectToPerformerHandlerWithEvent(event, top.performer, top.performerId)}
                                                >
                                                    {top.performer}
                                                </a>
                                            }
                                        </TableCell>
                                        <TableCell>{top.song.title}</TableCell>
                                        <TableCell>
                                            <ButtonGroup color="primary" aria-label="outlined primary button group">
                                                <Button disabled={this.canYouDecrementHandler(top)} onClick={() => this.decrementVote(top.id)}>-</Button>
                                                <Button disabled>{top.likes}</Button>
                                                <Button disabled={this.canYouIncrementHandler(top)} onClick={() => this.incrementVote(top.id)}>+</Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {this.state.canUserVote ?
                        <React.Fragment>
                            <Button
                                className={'mt-2'}
                                onClick={() => this.submitVoteHandler()}
                                disabled={this.state.availableVotes === 15}
                                variant="contained"
                                style={{backgroundColor: 'orange'}}
                            >
                                Balsuoti
                            </Button>
                            <span className={'ml-2'}>(Liko balsų - {this.state.availableVotes})</span>
                        </React.Fragment>
                        :
                        null
                    }
                </CardContent>
            </Card>
        );
    }
}

export default withRouter(Top40);
