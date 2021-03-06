import React, { Component } from 'react'
import style from '../SynchronizeResultModal/SynchronizeResultModal.css'
import store from '../../../store/UserStore'

const token = localStorage.getItem("token")

export default class SynchronizeResultModal extends Component {

    state = {
        updateList: [],
        startingDate: [],
        notification:'',
        selected: false
    }

    handelSelectedData = (data) => {
        let result = []

        if (this.state.updateList.includes(data) === true) {
            result = this.state.updateList.filter(team => team !== data)

            this.setState({
                updateList: result
            })
        } else {
            result = this.props.githubApi.filter(team => team === data)
            this.setState({
                updateList: [
                    ...this.state.updateList,
                    result[0]
                ]
            })
        }
    }

    handelNewDateValue = (e) => {
        this.setState({
            startingDate: e.target.value
        })
    }

    handelNewStartingDate = (teamName, startingDate) => {
        if (startingDate) {
            let updateList = this.state.updateList.map(team => {
                if (teamName === team.teamName) {
                    return {
                        teamName: teamName,
                        created_at: startingDate,
                        members:team.members
                    }
                }
                return team
            }) 
            this.setState({
                updateList,
                notification:'You have successfully changed the starting date!'
            })
        }

    }

    handelFirstToUpperCase = (str)=> {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
    }


    handelSaveUpdate = async () => {

        try {
            await fetch('http://localhost:3005/api/githubSync', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify(this.state.updateList)
            })
        } catch (err) {
            console.log(err)
        }
        this.setState({
            updateList: []
        })
        this.handelClose()
        store.loadUsers()
    }

    handelClose = (e) => {
        this.props.handelClose && this.props.handelClose(e)
    }
    render() {

        if (!this.props.synchronized) {
            return null
        }
        return (
            <div className={style.backDrop}>
                <div className={style.syncModal}>
                    <div>
                        <div>
                            <h3>Update</h3>
                        </div>
                        <div className={style.resultSelector}>
                            <ul className={style.resultBox}>
                                {this.props.conflictData.map(team => {
                                    return (
                                        <li key={team.created_at} className={style.teamList}>
                                            <input type="checkbox" onChange={() => { this.handelSelectedData(team) }} />
                                            {this.handelFirstToUpperCase(team.teamName)}
                                            <ul>
                                                {team.members.map(member => {
                                                    return (
                                                        <li key={member.id} className={style.memberList}>
                                                            <input type="checkbox" onChange={() => { }} />
                                                            {member.name || this.handelFirstToUpperCase(member.login)}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={style.resultSelector}>
                            <ul className={style.resultBox}>
                                {this.state.updateList.map(team => {
                                    return (
                                        <li key={team.created_at} className={style.teamList}>
                                            {this.handelFirstToUpperCase(team.teamName)}
                                            <input className={style.dateSelector} type="date" placeholder={team.created_at} value={this.state.startingDate} onChange={(e) => { this.handelNewDateValue(e) }} />
                                            <button className={style.button_save} onClick={() => { this.handelNewStartingDate(team.teamName, this.state.startingDate) }}>Save</button><p>{this.state.notification}</p>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                    <button className={style.button_save} onClick={() => { this.handelSaveUpdate() }}>Save</button>
                    <button className={style.button_cancel} onClick={(e) => { this.handelClose(e) }}>Cancel</button>
                </div>
            </div>

        )
    }
}