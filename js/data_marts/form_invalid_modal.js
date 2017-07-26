import React from 'react';
import {
    Modal, Button
} from 'react-bootstrap';


export class FormInvalidModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: props.show,
            onClose: props.onClose
        };
    }

    close() {
        this.setState({ showModal: false });
    }

    open() {
        this.setState({ showModal: true });
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{"Formulaire invalide"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>{"Le formulaire est invalide"}</h4>
                    <p>{"Veuillez selectionner une entité géographique."}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>{"Fermer"}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
