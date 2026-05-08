import React from "react";
import './App.css';

export default class App extends React.Component {
  state = {
    deck: JSON.parse(localStorage.getItem("flashcards-deck")) || [],
    frontText: "",
    backText: "",
    studyIndex: 0,
    isFrontShowing: true,
    onlyUnlearned: false,
    editingId: null
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.deck !== this.state.deck) {
      localStorage.setItem("flashcards-deck", JSON.stringify(this.state.deck))
    }
  }

  handleChangeFront = (e) => {
    this.setState({ frontText: e.target.value });
  }

  handleChangeBack = (e) => {
    this.setState({ backText: e.target.value });
  }

  handleEditClick = (card) => () => {
    this.setState({
      frontText: card.front,
      backText: card.back,
      editingId: card.id
    });
  }

  handleAddCard = () => {
    const front = this.state.frontText.trim();
    const back = this.state.backText.trim();

    if (!front || !back) {
      alert('You should fill in both inputs!');
      return;
    }

    const newCard = {
      id: Date.now(),
      front: front,
      back: back,
      isLearned: false
    };

    this.setState((prevState) => ({
      deck: [newCard, ...prevState.deck],
      frontText: "",
      backText: ""
    }));
  }

  handleSaveEdit = () => {
    const front = this.state.frontText.trim();
    const back = this.state.backText.trim();

    if (!front || !back) {
      alert('You should fill in both inputs!');
      return;
    }

    this.setState((prevState) => {
      let updatedDeck = prevState.deck.map((card) => {
        if (card.id === prevState.editingId) {
          return {
            id: card.id,
            front: front,
            back: back,
            isLearned: card.isLearned
          };
        } else {
          return card;
        }
      });

      return { 
        deck: updatedDeck, 
        frontText: "", 
        backText: "", 
        editingId: null 
      };
    });
  }
  
  handleDelCard = (id) => () => {
    this.setState(({ deck }) => ({
      deck: deck.filter((card) => card.id !== id)
    }))
  }

  handleFlip = () => {
    this.setState({ isFrontShowing: !this.state.isFrontShowing })
  }

  handlePrev = () => {
    this.setState((prevState) => {
      const currentDeck = prevState.onlyUnlearned ? prevState.deck.filter(c => !c.isLearned) : prevState.deck;
      let prevIndex = 0;

      if (currentDeck.length > 0) {
        if (prevState.studyIndex === 0) {
          prevIndex = currentDeck.length - 1;
        } else {
          prevIndex = prevState.studyIndex - 1;
        }
      }

      return {
        studyIndex: prevIndex,
        isFrontShowing: true
      }
    })
  }

  handleNext = () => {
    this.setState((prevState) => {
      const currentDeck = prevState.onlyUnlearned ? prevState.deck.filter(c => !c.isLearned) : prevState.deck;
      const nextIndex = currentDeck.length > 0 ? (prevState.studyIndex + 1) % currentDeck.length : 0;

      return {
        studyIndex: nextIndex,
        isFrontShowing: true
      }
    })
  }

  handleShuffle = () => {
    this.setState((prevState) => {
      let shuffledDeck = [...prevState.deck];
      
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
 
        let temp = shuffledDeck[i];
        shuffledDeck[i] = shuffledDeck[j];
        shuffledDeck[j] = temp;
      }

      return {
        deck: shuffledDeck,
        studyIndex: 0,
        isFrontShowing: true
      }
    })
  }

  handleToggleLearned = (id) => () => {
    this.setState((prevState) => {
      let updatedDeck = prevState.deck.map((card) => {
        if (card.id === id) {
          return {
            id: card.id,
            front: card.front,
            back: card.back,
            isLearned: !card.isLearned
          };
        } else {
          return card;
        }
      });

      return { 
        deck: updatedDeck 
      };
    });
  }

  render() {
    const { deck, studyIndex, isFrontShowing, onlyUnlearned, editingId } = this.state;
    const filteredDeck = onlyUnlearned ? deck.filter(card => !card.isLearned) : deck;
    const currentCard = filteredDeck[studyIndex] || {};

    return (
      <div className="App" style={{ padding: "20px" }}>
        <h1>FlashCards</h1>

        <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #b1afaf" }}>
          <h3>{editingId ? "Edit Card" : "Create Card"}</h3>

          <input type="text" placeholder="Front text/Question..." value={this.state.frontText} onChange={this.handleChangeFront}/>
          <input type="text" placeholder="Back text/Answer..." value={this.state.backText} onChange={this.handleChangeBack} style={{ marginLeft: "10px" }}/>
          
          <button onClick={editingId ? this.handleSaveEdit : this.handleAddCard} style={{ marginLeft: "10px" }}>
            {editingId ? "Save" : "Add"}
          </button>
        </div>

        <div style={{ marginBottom: "20px", padding: "20px", border: "2px solid #b1afaf", textAlign: "center" }}>
          <h2>Study</h2>

          <label style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={onlyUnlearned} onChange={() => this.setState({ onlyUnlearned: !onlyUnlearned, studyIndex: 0 })}/>Show only unlearned cards
          </label>

          <div onClick={this.handleFlip} style={{ padding: "40px", background: isFrontShowing ? "#f0f8ff" : "#fff3cd", cursor: "pointer", borderRadius: "10px" }}>
            {isFrontShowing ? (currentCard.front || "No Cards in the deck") : (currentCard.back || "No Cards in the deck")}
          </div>

          <button onClick={this.handlePrev} style={{ marginTop: "10px" }}>Prev Card</button>
          <button onClick={this.handleNext} style={{ marginTop: "10px", marginLeft: "10px" }}>Next Card</button>
          <button onClick={this.handleShuffle} style={{ marginLeft: "10px" }}>Shuffle Deck</button>
        </div>

        <div className="cards-list">
          <h2>Cards Collection: {deck.length}</h2>

          {deck.map((card) => (
            <div key={card.id} style={{ borderBottom: "1px solid #b1afaf", padding: "10px", display: "flex", alignItems: "center" }}>
              <input type="checkbox" checked={card.isLearned} onChange={this.handleToggleLearned(card.id)} style={{ marginRight: "10px" }}/>
              
              <span style={{color: card.isLearned ? "#999" : "#000", flexGrow: 1 }}>{card.front} — {card.back}</span>

              <button onClick={this.handleEditClick(card)} style={{ marginLeft: "15px" }}>Edit</button>
              <button onClick={this.handleDelCard(card.id)} style={{ marginLeft: "10px" }}>Del</button>
            </div>
          ))}
        </div>
      </div>
    )
  }
}