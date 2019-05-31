import * as React from "react";
import {
  updatePlayer,
  updatePlayerName,
  updatePlayerId,
  updatePlayerNo,
  updateCards,
  updateOutput
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
  Picker,
  YellowBox
} from "react-native";


class HomeContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: null,
      bidVisible: false,
      trumpVisible: false,
      active: false,
      preMonitor: false,
      state: "player",
      card1: true,
      card2: true,
      card3: true,
      card4: true,
      card5: true,
      card6: true,
    };
  }
  componentDidMount() {
    YellowBox.ignoreWarnings(['Warning: ReactNative.createElement']);
    this.socket = io("http://172.20.10.11:3999");
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
    this.socket.on("monitor-start", result => {
      console.log("socket hitted", result);
      if (
        result.teamName === this.props.teamName &&
        result.playerName === this.props.name
      ) {

        this.setState({ preMonitor: false });
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
        if (this.state.state != 'monitor') {
          this.props.updateStatus("play");
        }

      }
    });
    this.socket.on("select-trump", msg => {
      console.log("hit select trump");
      console.log("socket hitted", msg);
      if (
        msg.teamName === this.props.teamName &&
        msg.playerName === this.props.name
      ) {
        this.setState({ trumpVisible: true });
      }
    });

    this.socket.on("play", result => {
      this.props.updateOutput({ player1: null, player2: null, player3: null, player4: null })

      if (
        result.teamName === this.props.teamName &&
        result.playerNo === this.props.playerNo
      ) {
        this.setState({ avtive: false });
        Alert.alert("Your Chance", "Click suitable Card", [
          { text: "OK", onPress: () => console.log("You press ok") },
          { cancelable: false }
        ]);
        this.setState({ avtive: false });
        this.props.updateOutput(result.output)
      }
      if (result.teamName === this.props.teamName) {
        console.log("test functiin", result.output)

        this.props.updateOutput(result.output)


      }
    });
  }

  setPlayerId() {
    let n = Math.floor(Math.random() * 1000).toString();
    this.props.updateStatus("configTeam");
  }
  setTeamName() {
    POST("createTeam", {
      teamName: this.props.teamName,
      playerId: this.props.name
    }).then(result => {
      console.log(result);
      if (result.response.data.success === true) {
        console.log(result.response.data.success);
        this.props.updatePlayerNo(1);
        this.props.updateStatus("wait");
      }
    });
  }
  getjoinTeam() {
    POST("showTeams", null).then(result => {
      console.log(result.response.data);
      this.setState({ teams: result.response.data });
      this.props.updateStatus("joinTeam");
    });
  }
  joinMonitorTeam(teamName) {
    console.log("monitor funtion call")
    POST("addMonitor", { teamName: teamName, playerId: this.props.name }).then(
      result => {
        this.props.updateTeamName(teamName);
        this.props.updateStatus("monitor");
      }
    );
    POST("getGameStatus", { teamName: teamName }).then(
      result => {
        if (result.response.data.gameStatus == "configering" || result.response.data.gameStatus == "bid") {
          this.setState({ preMonitor: true })
        }
        if (result.response.data.gameStatus == "start") {
          this.setState({ preMonitor: false })
        }
      }
    );
  }
  joinTeam(teamNamee) {
    POST("addPlayer", { teamName: teamNamee, playerId: this.props.name }).then(
      result => {
        console.log(result);

        if (result.response.data.status === "Team you desided is full") {
          Alert.alert("Full", "Team you decided is full of players", [
            { text: "OK", onPress: () => console.log("You press ok") },
            { cancelable: false }
          ]);
        } else {
          console.log(result.response.data.no);
          this.props.updateTeamName(teamNamee);
          this.props.updatePlayerNo(result.response.data.no);
          this.props.updateStatus("wait");
        }
      }
    );
  }

  async getCards() {
    console.log("get cards call");
    console.log(this.props.teamName);
    let cards = null;
    await POST("getTeam", { teamName: this.props.teamName }).then(result => {
      console.log("team", result);
      this.props.updateTeam(result.response.data.Team);
      console.log("update team", this.props.team);
    });

    await POST("distribute", { teamName: this.props.teamName }).then(result => {
      console.log("card distributed", result);
      if (this.props.playerNo == 1) {
        cards = result.response.data.player1;
      } else if (this.props.playerNo == 2) {
        cards = result.response.data.player2;
      } else if (this.props.playerNo == 3) {
        cards = result.response.data.player3;
      } else if (this.props.playerNo == 4) {
        cards = result.response.data.player4;
      }
      else {
        cards = result.response.data.player4;
      }

      console.log(this.props.status);
    });

    this.props.updateCards(cards);
    if (this.state.state == 'monitor') {
      this.props.updateStatus("monitor");
    } else {
      this.props.updateStatus("bid");
    }

    console.log(this.props.cards)
  }

  async play(card) {
    POST("play", {
      teamName: this.props.teamName,
      playerNo: this.props.playerNo,
      card: card
    }).then(result => {
      this.setState({ output: result.response.data.output });
      console.log('card recieved', result.response.data.output)
    });

  }

  _renderHome = () => {
    return (
      <View style={Styles.container}>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Enter your name to continue
          </Text>
        </View>
        <TextInput
          style={{
            borderColor: "gray",
            borderWidth: 2,
            borderRadius: 5,
            margin: 30
          }}
          onChangeText={text => this.props.updatePlayerName(text)}
          value={this.props.name}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "flex-end",
            marginBottom: 50
          }}
        >
          <TouchableOpacity
            onPress={this.setPlayerId.bind(this)}
            style={{
              backgroundColor: "black",
              height: 35,
              width: 150,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              margin: 20
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  _renderMonitorTeam = () => {
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
              alignSelf: "center",
              position: "absolute",
              marginLeft: 10
            }}
          >
            Monitor
          </Text>

        </View>
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
            Biding Player : {this.props.bidder}
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
            backgroundColor: "#50c00c"
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
                backgroundColor: "#f9f9f9",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 1: {this.props.team.player1}</Text>
              {this.props.output.player1 != null ? (
                <Text>{this.props.output.player1.type}</Text>
              ) : null}
              {this.props.output.player1 != null ? (
                <Text>{this.props.output.player1.value}</Text>
              ) : null}
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
                  backgroundColor: "#f9f9f9",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 2: {this.props.team.player2}</Text>
                {this.props.output.player2 != null ? (
                  <Text>{this.props.output.player2.type}</Text>
                ) : null}
                {this.props.output.player2 != null ? (
                  <Text>{this.props.output.player2.value}</Text>
                ) : null}
              </View>
              <View
                style={{
                  width: 115,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 4: {this.props.team.player4}</Text>
                {this.props.output.player4 != null ? (
                  <Text>{this.props.output.player4.type}</Text>
                ) : null}
                {this.props.output.player4 != null ? (
                  <Text>{this.props.output.player4.value}</Text>
                ) : null}
              </View>
            </View>
            <View
              style={{
                width: 115,
                height: "30%",
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: "#f9f9f9",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 3: {this.props.team.player3}</Text>
              {this.props.output.player3 != null ? (
                <Text>{this.props.output.player3.type}</Text>
              ) : null}
              {this.props.output.player3 != null ? (
                <Text>{this.props.output.player3.value}</Text>
              ) : null}
            </View>
          </View>
        </View>

      </View>
    );
  }
  _renderConfigteam = () => {
    return (
      <View style={Styles.container}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateStatus("home");
          }}
        >
          <Text
            style={{
              marginLeft: 20,
              marginTop: 8,
              backgroundColor: "black",
              color: "white",
              width: 60,
              height: 20,
              paddingBottom: 2,
              paddingLeft: 6,
              borderRadius: 5
            }}
          >
            {"<- back"}
          </Text>
        </TouchableOpacity>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Wellcome!
          </Text>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "flex-end",
            marginBottom: 50
          }}
        ><TouchableOpacity
          onPress={() => {
            this.setState({ state: 'monitor' })
            this.props.updateStatus("joinMonitor");
            console.log("call configer function to monitor");
          }}
          style={{
            backgroundColor: "black",
            height: 35,
            width: 150,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            margin: 20
          }}
        >
            <Text style={{ color: "#fff", fontSize: 18 }}>Monitor Team</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.updateStatus("createTeam");
            }}
            style={{
              backgroundColor: "black",
              height: 35,
              width: 150,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              margin: 20
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>Create Team</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.getjoinTeam.bind(this)}
            style={{
              backgroundColor: "black",
              height: 35,
              width: 150,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              margin: 20
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>Join Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderCreateTeam = () => {
    return (
      <View style={Styles.container}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateStatus("configTeam");
          }}
        >
          <Text
            style={{
              marginLeft: 20,
              marginTop: 8,
              backgroundColor: "black",
              color: "white",
              width: 60,
              height: 20,
              paddingBottom: 2,
              paddingLeft: 6,
              borderRadius: 5
            }}
          >
            {"<- back"}
          </Text>
        </TouchableOpacity>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Enter Team name
          </Text>
        </View>
        <TextInput
          style={{
            borderColor: "gray",
            borderWidth: 2,
            borderRadius: 5,
            margin: 30
          }}
          onChangeText={text => this.props.updateTeamName(text)}
          value={this.props.teamName}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "flex-end",
            marginBottom: 50
          }}
        >
          <TouchableOpacity
            onPress={this.setTeamName.bind(this)}
            style={{
              backgroundColor: "black",
              height: 35,
              width: 150,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              margin: 20
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  _renderWait = () => {
    return (
      <View style={Styles.container}>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Wait for other players
          </Text>
        </View>
        <View style={{ marginLeft: 30 }}>
          <ActivityIndicator size="large" color="#fac905" />
        </View>
      </View>
    );
  };
  _renderSelectPoint = () => {
    return (
      <View
        style={{
          position: "absolute",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
          backgroundColor: "#d4d4d4",
          margin: 50,
          marginBottom: 0,
          marginTop: "50%",
          borderRadius: 3,
          width: 350,
          padding: 100,

        }}
      >
        <Text style={{ alignSelf: "center" }}>Enter point</Text>
        <Picker
          selectedValue={this.state.bidVal}
          style={{
            height: 50,
            width: 200,
            alignSelf: "center",
            backgroundColor: "#fefef"
          }}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({ bidVal: itemValue })
          }
        >
          <Picker.Item label="100" value="100" />
          <Picker.Item label="110" value="110" />
          <Picker.Item label="120" value="120" />
          <Picker.Item label="130" value="130" />
          <Picker.Item label="140" value="140" />
          <Picker.Item label="150" value="150" />
          <Picker.Item label="160" value="160" />
        </Picker>
        <TouchableOpacity
          onPress={() => {
            console.log("pressed");
            POST("bid", {
              teamName: this.props.teamName,
              playerId: this.props.name,
              playerNo: this.props.playerNo,
              bidPoint: this.state.bidVal
            }).then(result => {
              console.log(result);
            });
            this.setState({ bidVisible: false });
          }}
        >
          <View
            style={{
              alignItems: "center",
              alignSelf: "center",
              marginTop: 10,
              backgroundColor: "#000",
              color: "#fff",
              width: 100,
              borderRadius: 2
            }}
          >
            <Text style={{ color: "#fff", padding: 5 }}>Bid</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            console.log("pressed");
            POST("bid", {
              teamName: this.props.teamName,
              playerId: this.props.name,
              playerNo: this.props.playerNo,
              bidPoint: 0
            }).then(result => {
              console.log(result);
            });
            this.setState({ bidVisible: false });
          }}
        >
          <View
            style={{
              alignItems: "center",
              alignSelf: "center",
              marginTop: 10,
              backgroundColor: "#000",
              color: "#fff",
              width: 100,
              borderRadius: 2
            }}
          >
            <Text style={{ color: "#fff", padding: 5 }}>Cancel</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  _renderSelectTrump = () => {
    return (
      <Modal>
        <View
          style={{
            alignContent: "center",
            justifyContent: "flex-start",
            alignItems: "center",
            borderRadius: 3,
            width: "100%",
            marginTop: "40%",
            flex: 1
          }}
        >
          <Text style={{ alignSelf: "center", marginBottom: 20 }}>
            Select Trump Card
          </Text>
          <View
            style={{
              flexDirection: "row"
            }}
          >
            <TouchableOpacity
              onPress={() => {
                console.log("pressed");
                POST("selectTrump", {
                  teamName: this.props.teamName,
                  trump: this.props.cards[0]
                }).then(result => {
                  console.log(result);
                });
                this.setState({ trumpVisible: false });
              }}
            >
              <View
                style={{
                  height: 80,
                  backgroundColor: "#50c00c",
                  margin: 3,
                  width: 80,
                  alignItems: "center",
                  paddingTop: 20
                }}
              >
                <Text>{this.props.cards[0].type}</Text>
                <Text>{this.props.cards[0].value}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("pressed");
                POST("selectTrump", {
                  teamName: this.props.teamName,
                  trump: this.props.cards[1]
                }).then(result => {
                  console.log(result);
                });
                this.setState({ trumpVisible: false });
              }}
            >
              <View
                style={{
                  height: 80,
                  backgroundColor: "#50c00c",
                  margin: 3,
                  width: 80,
                  alignItems: "center",
                  paddingTop: 20
                }}
              >
                <Text>{this.props.cards[1].type}</Text>
                <Text>{this.props.cards[1].value}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                console.log("pressed");
                POST("selectTrump", {
                  teamName: this.props.teamName,
                  trump: this.props.cards[2]
                }).then(result => {
                  console.log(result);
                });
                this.setState({ trumpVisible: false });
              }}
            >
              <View
                style={{
                  height: 80,
                  backgroundColor: "#50c00c",
                  margin: 3,
                  width: 80,
                  alignItems: "center",
                  paddingTop: 20
                }}
              >
                <Text>{this.props.cards[2].type}</Text>
                <Text>{this.props.cards[2].value}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  _renderJoinTeam = () => {
    return (
      <View style={Styles.container}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateStatus("configTeam");
          }}
        >
          <Text
            style={{
              marginLeft: 20,
              marginTop: 8,
              backgroundColor: "black",
              color: "white",
              width: 60,
              height: 20,
              paddingBottom: 2,
              paddingLeft: 6,
              borderRadius: 5
            }}
          >
            {"<- back"}
          </Text>
        </TouchableOpacity>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Click team to JOIN
          </Text>
        </View>
        <View style={{ marginLeft: 30 }}>
          <FlatList
            data={this.state.teams}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <View style={{ margin: 4, fontSize: 25, height: 25 }}>
                <TouchableOpacity onPress={() => this.joinTeam(item.teamName)}>

                  <Text style={{ padding: 5, color: '#000', fontWeight: 'bold', margin: 5 }}>{item.teamName}</Text>

                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.teamName}
          />
        </View>
      </View>
    );
  };
  _renderJoinMonitorTeam = () => {
    POST("showTeams", null).then(result => {
      console.log(result.response.data);
      this.setState({ teams: result.response.data });

    });
    console.log("monitr part")
    return (
      <View style={Styles.container}>
        <TouchableOpacity
          onPress={() => {
            this.props.updateStatus("configTeam");
          }}
        >
          <Text
            style={{
              marginLeft: 20,
              marginTop: 8,
              backgroundColor: "black",
              color: "white",
              width: 60,
              height: 20,
              paddingBottom: 2,
              paddingLeft: 6,
              borderRadius: 5
            }}
          >
            {"<- back"}
          </Text>
        </TouchableOpacity>
        <View style={Styles.background}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            Click team to Monitor
          </Text>
        </View>
        <View style={{ marginLeft: 30 }}>
          <FlatList
            data={this.state.teams}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <View style={{ margin: 4, fontSize: 25, height: 20 }}>
                <TouchableOpacity onPress={() => this.joinMonitorTeam(item.teamName)}>
                  <Text style={{ padding: 5, color: '#000', fontWeight: 'bold' }}>{item.teamName}</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.teamName}
          />
        </View>
      </View>
    );
  };

  _renderBid = () => {
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
            backgroundColor: "#50c00c"
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
                backgroundColor: "#f9f9f9",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 1: {this.props.team.player1}</Text>

              {this.props.output.player1 != null ? (
                <Text>{this.props.output.player1.type}</Text>
              ) : null}
              {this.props.output.player1 != null ? (
                <Text>{this.props.output.player1.value}</Text>
              ) : null}
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
                  backgroundColor: "#f9f9f9",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 2: {this.props.team.player2}</Text>
                {this.props.output.player2 != null ? (
                  <Text>{this.props.output.player2.type}</Text>
                ) : null}
                {this.props.output.player2 != null ? (
                  <Text>{this.props.output.player2.value}</Text>
                ) : null}
              </View>
              <View
                style={{
                  width: 115,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  marginLeft: 20,
                  borderRadius: 3,
                  paddingTop: 20
                }}
              >
                <Text>Player 4: {this.props.team.player4}</Text>
                {this.props.output.player4 != null ? (
                  <Text>{this.props.output.player4.type}</Text>
                ) : null}
                {this.props.output.player4 != null ? (
                  <Text>{this.props.output.player4.value}</Text>
                ) : null}
              </View>
            </View>
            <View
              style={{
                width: 115,
                height: "30%",
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: "#f9f9f9",
                margin: 5,
                borderRadius: 3,
                paddingTop: 20
              }}
            >
              <Text>Player 3: {this.props.team.player3}</Text>
              {this.props.output.player3 != null ? (
                <Text>{this.props.output.player3.type}</Text>
              ) : null}
              {this.props.output.player3 != null ? (
                <Text>{this.props.output.player3.value}</Text>
              ) : null}
            </View>
          </View>
        </View>
        <View
          style={{
            width: "100%",
            height: "21%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1aa516"
          }}
        >

          {this.state.card1 ? (
            <TouchableOpacity
              disabled={this.state.active}
              onPress={() => {
                this.play(this.props.cards[0]);
                this.setState({ card1: false })
              }}
              style={{
                margin: 4,
                fontSize: 20,
                height: "60%",
                width: "14%",
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", color: '#000' }}>
                {this.props.cards[0].type}
              </Text>
              <Text>{this.props.cards[0].value}</Text>
            </TouchableOpacity>
          ) : null}
          {this.state.card2 ? (
            <TouchableOpacity
              disabled={this.state.active}
              onPress={() => {
                this.play(this.props.cards[1]);
                this.setState({ card2: false })
              }}
              style={{
                margin: 4,
                fontSize: 20,
                height: "60%",
                width: "14%",
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", color: '#000' }}>
                {this.props.cards[1].type}
              </Text>
              <Text>{this.props.cards[1].value}</Text>
            </TouchableOpacity>
          ) : null}

          {this.state.card3 ? (<TouchableOpacity
            disabled={this.state.active}
            onPress={() => {
              this.play(this.props.cards[2]);
              this.setState({ card3: false })
            }}
            style={{
              margin: 4,
              fontSize: 20,
              height: "60%",
              width: "14%",
              backgroundColor: "#f9f9f9",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ fontWeight: "bold", color: '#000' }}>
              {this.props.cards[2].type}
            </Text>
            <Text>{this.props.cards[2].value}</Text>
          </TouchableOpacity>) : null}

          {this.props.status == "play" && this.state.card4 ? (
            <TouchableOpacity
              disabled={this.state.active}
              onPress={() => {
                this.play(this.props.cards[3]);
                this.setState({ card4: false })

              }}
              style={{
                margin: 4,
                fontSize: 20,
                height: "60%",
                width: "14%",
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", color: '#000' }}>
                {this.props.cards[3].type}
              </Text>
              <Text>{this.props.cards[3].value}</Text>
            </TouchableOpacity>
          ) : null}
          {this.props.status == "play" && this.state.card5 ? (
            <TouchableOpacity
              disabled={this.state.active}
              onPress={() => {
                this.play(this.props.cards[4]);
                this.setState({ card5: false })
              }}
              style={{
                margin: 4,
                fontSize: 20,
                height: "60%",
                width: "14%",
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", color: '#000' }}>
                {this.props.cards[4].type}
              </Text>
              <Text>{this.props.cards[4].value}</Text>
            </TouchableOpacity>
          ) : null}
          {this.props.status == "play" && this.state.card6 ? (
            <TouchableOpacity
              disabled={this.state.active}
              onPress={() => {
                this.play(this.props.cards[5]);
                this.setState({ card6: false })
              }}
              style={{
                margin: 4,
                fontSize: 20,
                height: "60%",
                width: "14%",
                backgroundColor: "#f9f9f9",
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={{ fontWeight: "bold", color: '#000' }}>
                {this.props.cards[5].type}
              </Text>
              <Text>{this.props.cards[5].value}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };


  render() {
    console.disableYellowBox = true;
    return (
      <View style={{ flex: 1 }}>
        {this.props.status == "home" ? this._renderHome() : null}
        {this.props.status == "configTeam" ? this._renderConfigteam() : null}
        {this.props.status == "createTeam" ? this._renderCreateTeam() : null}
        {this.props.status == "wait" ? this._renderWait() : null}
        {this.props.status == "joinTeam" ? this._renderJoinTeam() : null}
        {this.props.status == "bid" || this.props.status == "play"
          ? this._renderBid()
          : null}
        {this.props.status == "joinMonitor" ? this._renderJoinMonitorTeam() : null}
        {this.props.status == "monitor" ? this._renderMonitorTeam() : null}
        {this.state.bidVisible ? this._renderSelectPoint() : null}
        {this.state.trumpVisible ? this._renderSelectTrump() : null}
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
    updateBid: data => dispatch(updateBid(data)),
    updateOutput: data => dispatch(updateOutput(data))
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
  bidder: state.rootReducer.bidder,
  output: state.playerReducer.output
});
export default connect(
  mapStateToProps,
  bindAction
)(HomeContainer);
