import React, { Component } from "react";
import { Feed, Header, Icon, Divider } from "semantic-ui-react";
import FeedSpend from "../common/feedSpend";
import FeedSend from "../common/feedSend";
import FeedDistribute from "../common/feedDistribute";
import http from "../../services/httpService";

class InnovationFeed extends Component {
  state = { isFetching: false, feed: [] };

  async componentDidMount() {
    this.setState({ isFetching: true });
    const { data } = await http.get("http://localhost:3900/api/feed");
    this.setState({ isFetching: false, feed: data });
  }

  renderTransaction({ kind, user, user2, amount, description, hash }) {
    switch (kind) {
      case "spend":
        return (
          <FeedSpend
            user={user}
            amount={amount}
            description={description}
            hash={hash}
          />
        );
      case "send":
        return (
          <FeedSend
            user={user}
            user2={user2}
            amount={amount}
            description={description}
            hash={hash}
          />
        );
      case "dist":
        return (
          <FeedDistribute
            amount={amount}
            description={description}
            hash={hash}
          />
        );
    }
  }

  render() {
    console.log(this.state.transactions);

    return (
      <div className="six wide column ui segment">
        <Header as="h3">
          <Icon name="rss" />
          Innovation Feed
        </Header>
        <Divider />
        <Feed>{this.state.feed.map(item => this.renderTransaction(item))}</Feed>
      </div>
    );
  }
}

export default InnovationFeed;
