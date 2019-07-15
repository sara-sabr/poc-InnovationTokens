import React, { Component } from "react";
import Joi from "joi-browser";
import { Form, Button, Search, Popup } from "semantic-ui-react";
import http from "../../services/httpService";

class SendForm extends Component {
  state = {
    data: {
      amount: "",
      message: "",
      recipientId: ""
    },
    search: {
      isLoading: false,
      results: [],
      value: ""
    },
    balance: 0,
    errors: {}
  };

  schema = {
    balance: Joi.number(),
    amount: Joi.number()
      .integer()
      .min(1)
      .max(Joi.ref("balance"))
      .required()
      .label("Amount"),
    message: Joi.string().label("Message"),
    recipientId: Joi.string()
      .required()
      .label("Recipient")
  };

  componentDidMount() {
    this.setState({ balance: this.props.balance });
  }

  handleResultSelect = (e, { result }) => {
    const state = { ...this.state };
    state.search.value = result.title;
    state.data.recipientId = result.id;

    this.setState(state);
  };

  handleSearchChange = async (e, { value }) => {
    const search = { ...this.state.search };
    search.isLoading = true;
    search.value = value;

    this.setState({ search });

    http.get(`http://localhost:3900/api/users?query=${value}`).then(res => {
      const search = { ...this.state.search };
      search.isLoading = false;
      search.results = res.data.map(i => ({
        title: `${i.first} ${i.last}`,
        description: i.email,
        id: i._id
      }));

      this.setState({ search });
    });
  };

  updateData = (k, v) => {
    const data = { ...this.state.data };
    data[k] = v;
    this.setState({ data });
  };

  doSubmit = () => {
    const { balance } = this.state;
    const { amount, message, recipientId } = this.state.data;

    const { error: errors } = Joi.validate(
      { balance, amount, message, recipientId },
      this.schema,
      {
        abortEarly: false
      }
    );

    if (errors) {
      this.setState({ errors });
      return;
    }

    try {
    } catch (ex) {
      if (ex.res && ex.res.status === 400) {
        const errors = { ...this.state.errors };
        errors.first = ex.res.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    const { isLoading, value, results } = this.state.search;

    return (
      <React.Fragment>
        <h4>Send Tokens</h4>
        <Form onSubmit={this.doSubmit}>
          <Form.Input
            required
            fluid
            placeholder="Amount"
            onChange={e => this.updateData("amount", e.target.value)}
          />
          <Form.Input
            required
            fluid
            placeholder="Message"
            onChange={e => this.updateData("message", e.target.value)}
          />
          <Form.Field
            fluid
            required
            placeholder="Recipient"
            onChange={e => this.updateData("recipientId", e.target.value)}
          >
            <Popup
              content="Lookup people by name or email."
              trigger={
                <Search
                  className="field input"
                  placeholder="Recipient"
                  loading={isLoading}
                  minCharacters={2}
                  onResultSelect={this.handleResultSelect}
                  onSearchChange={this.handleSearchChange}
                  results={results}
                  value={value}
                />
              }
            />
          </Form.Field>
          <Button
            type="submit"
            className="primary basic"
            disabled={!this.state.data.amount || !this.state.data.recipientId}
          >
            Send
          </Button>
        </Form>
      </React.Fragment>
    );
  }
}

export default SendForm;