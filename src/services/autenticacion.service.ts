/* eslint-disable @typescript-eslint/naming-convention */
import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
import { Llaves } from '../config/llaves';
const generator = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository,
  ) {}

  /*
   * Add service methods here
   */

  GenerarClave() {
    const clave = generator(8, false);
    return clave;
  }

  CifrarClave(clave: string) {
    const claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  IdentificarPersona(usuario: string, clave: string) {
    try {
      const p = this.personaRepository.findOne({
        where: {correo: usuario, clave: clave},
      });
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      if (p) {
        return p;
      }
      return false;
    } catch {
      return false;
    }
  }

  GenerarTokenJWT(persona: Persona) {
    const token = jwt.sign(
      {
        data: {
          id: persona.id,
          correo: persona.correo,
          nombre: persona.nombres + '' + persona.apellidos,
        },
      },
      Llaves.claveJWT,
    );
    return token;
  }

  ValidarTokenJWT(token: string) {
    try {
       const datos = jwt.verify(token, Llaves.claveJWT);
       return datos;
    } catch {
      return false

    }
  }
}

