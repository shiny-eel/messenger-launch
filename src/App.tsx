/* global chrome */

import React, {Component} from 'react';
import './App.css';
import {getNameFromURL, Person} from './backend/util'

const logo = require('./logo.svg')

interface State {
    people: Person[]
}

class App extends Component<any, State> {
    state: State = {
        people: []
    };

    componentDidMount() {
        chrome.runtime.sendMessage({greeting: 'getPeople'}, (response) => {
            if (response) {
                this.setState({
                    // people: Object.assign(this.state.people, response.people)
                    people: response.people
                });
                console.log('HERE ARE THE PEOPLE', this.state.people)
            }
        });
    }

    onItemClick(event: React.MouseEvent<HTMLElement>) {
        let uname = event.currentTarget.dataset.id
        chrome.runtime.sendMessage({greeting: 'launch', username: uname})
    }

    peopleList(people: Person[]) {
        console.log('HERE ARE THE PEOPLE IN THE FUNCTION', people)
        const peopleArr = people
        if (!peopleArr || !peopleArr.length) return (null)
        console.log('made it here');
        const suggest = peopleArr[1].asSuggestion()
        console.log(suggest);
        const listItems = peopleArr.map((person: Person) =>
            <li onClick={e => this.onItemClick(e)} data-id={person.asSuggestion().content}>{person.title}</li>
        );
        return (
            <ul>{listItems}</ul>
        );
    }


    render() {
        const myName = getNameFromURL('https://www.messenger.com/t/nathan.henderson.7739');
        console.log(myName);
        // loadPeople( function(people) {
        //     console.log(people);
        // });
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                {this.peopleList(this.state.people)}
            </div>
        );
    }
}

export default App;