import * as React from "react";
import {
  updatePlayer,
  updatePlayerName,
  updatePlayerId,
  updatePlayerNo,
  updateCards
} from "../../store/player/actions";
import { updateTeam, updateTeamName } from "../../store/team/actions";
import { updateStatus, updateBid } from "../../store/root/actions";
import { connect } from "react-redux";
import { POST } from "../../api/api";
import io from "socket.io-client";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Picker
} from "react-native";

class HomeContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: null,
      bidVisible: false,
      trumpVisible: false,
      active: true
    };
  }
  componentDidMount() {
    this.socket = io("http://192.168.8.149:3999");
    this.socket.on("bid", result => {
      console.log("socket hitted", result);
      if (
        result.teamName === this.props.teamName &&
        result.playerNo === this.props.playerNo
      ) {
        console.log("hit bid");
        this.setState({ bidVisible: true, bidVal: result.bidVal });
      }
    });

    this.socket.on("start", msg => {
      console.log("hit start");
      console.log("socket hitted", msg);
      if (msg === this.props.teamName) {
        this.getCards();
        if (this.props.playerNo == 1) {
          this.setState({ bidVisible: true });
        }
      }
    });
    this.socket.on("round-start", msg => {
      console.log("hit round");
      console.log("socket hitted", msg);
      if (msg.teamName === this.props.teamName) {
        this.props.updateBid(msg);
        this.props.updateStatus("play");
        console.log(this.props.bidder);
      }
    });
    this.socket.on("select-trump", msg => {
      console.log("hit select trump");
      console.log("socket hitted", msg);
      if (
        msg.teamName === this.props.teamName &&
        msg.playerName === this.props.name
      ) {
        console.log("select trump before start game");
        this.setState({ trumpVisible: true });
      }
    });

    this.socket.on("play", result => {
      console.log("socket hitted", result);
      if (
        result.teamName === this.props.teamName &&
        result.playerNo === this.props.playerNo
      ) {
        Alert.alert("Your Chance", "Your change play card", [
          { text: "OK", onPress: () => console.log("You press ok") },
          { cancelable: false }
        ]);
        this.setState({ avtive: false });
      }
    });

    this.getStatus();
  }

  async getStatus() {
    await POST("getGameStatus", {
      teamName: this.props.teamName
    }).then(result => {
      console.log(result);
    });
  }

  _renderHome = () => {
    return (
      <View style={Styles.container}>
        <View
          style={{
            width: "100%",
            height: "10%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            paddingBottom: 15
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#000",
              alignSelf: "flex-start",
              position: "absolute",
              marginLeft: 10
            }}
          >
            Bid Point : {this.props.bidVal}
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#000",
              alignSelf: "flex-end",
              position: "absolute",
              paddingRight: 20
            }}
          >
            Bidder : {this.props.bidder}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            height: "70%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "red"
          }}
        >
          <View style={{ flex: 1, flexDirection: "column" }}>
            <View
              style={{
                width: 115,
                height: "30%",
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: "yellow",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 1: {this.props.team.player1}</Text>
            </View>
            <View
              style={{
                height: "30%",
                flexDirection: "row",
                margin: 5,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <View
                style={{
                  width: 115,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "yellow",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 2: {this.props.team.player2}</Text>
              </View>
              <View
                style={{
                  width: 115,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "yellow",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 4: {this.props.team.player4}</Text>
              </View>
            </View>
            <View
              style={{
                width: 115,
                height: "30%",
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: "yellow",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 3: {this.props.team.player3}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.status == "home" ? this._renderHome() : null}
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    width: "100%",
    height: "18%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingBottom: 15
  }
});

function bindAction(dispatch) {
  return {
    updatePlayer: data => dispatch(updatePlayer(data)),
    updatePlayerName: data => dispatch(updatePlayerName(data)),
    updatePlayerId: data => dispatch(updatePlayerId(data)),
    updatePlayerNo: data => dispatch(updatePlayerNo(data)),
    updateTeam: data => dispatch(updateTeam(data)),
    updateTeamName: data => dispatch(updateTeamName(data)),
    updateCards: data => dispatch(updateCards(data)),
    updateStatus: data => dispatch(updateStatus(data)),
    updateBid: data => dispatch(updateBid(data))
  };
}

const mapStateToProps = state => ({
  name: state.playerReducer.name,
  id: state.playerReducer.id,
  playerNo: state.playerReducer.playerNo,
  cards: state.playerReducer.cards,
  team: state.teamReducer.team,
  teamName: state.teamReducer.teamName,
  status: state.rootReducer.status,
  bidVal: state.rootReducer.bidVal,
  bidder: state.rootReducer.bidder
});
export default connect(
  mapStateToProps,
  bindAction
)(HomeContainer);
