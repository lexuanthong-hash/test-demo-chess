import React, { useState } from 'react'
import { auth, db } from './firebase'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'

export default function Home() {
    const { currentUser } = auth
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()
    const newGameOptions = [
        { label: 'Cờ Màu Đen', value: 'b' },
        { label: 'Cờ Màu Trắng', value: 'w' },
        { label: 'Ngẫu Nhiên', value: 'r' },
    ]

    function handlePlayOnline() {
        setShowModal(true)
    }

    async function startOnlineGame(startingPiece) {
        const member = {
            uid: currentUser.uid,
            piece: startingPiece === 'r' ? ['b', 'w'][Math.round(Math.random())] : startingPiece,
            name: localStorage.getItem('userName'),
            creator: true
        }
        const game = {
            status: 'waiting',
            members: [member],
            gameId: `${Math.random().toString(36).slice(2, 9)}_${Date.now()}`
        }
        await setDoc(doc(db, "games", game.gameId), game)
        navigate(`/game/${game.gameId}`)
    }

    function startLocalGame() {
        localStorage.removeItem('savedGame'); // Thêm dòng này để xóa trạng thái cũ
        navigate('/game/local')
    }

    return (
        <>
            <div className="columns home">
                <div className="column has-background-primary home-columns">
                    <button className="button is-link" onClick={startLocalGame}>
                        Play Locally
                    </button>
                </div>
                <div className="column has-background-link home-columns">
                    <button className="button is-primary"
                        onClick={handlePlayOnline}>
                        Play Online
                    </button>
                </div>
            </div>
            <div className={`modal ${showModal ? 'is-active' : ''}`}>
                <div className="modal-background"></div>
                <div className="modal-content">
                    <div className="card">
                        <div className="card-content">
                            <div className="content">
                                Vui lòng chọn màu cờ bạn muốn bắt đầu
                            </div>
                        </div>
                        <footer className="card-footer">
                            {newGameOptions.map(({ label, value }) => (
                                <span className="card-footer-item pointer" key={value}
                                    onClick={() => startOnlineGame(value)}>
                                    {label}
                                </span>
                            ))}
                        </footer>
                    </div>
                </div>
                <button className="modal-close is-large" onClick={() => setShowModal(false)}></button>
            </div>
        </>
    )
}