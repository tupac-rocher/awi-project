import { useState, useEffect } from 'react';
import Button from '../general/Button';
import NumberInput from '../general/NumberInput';
import TextInput from '../general/TextInput';
import SelectInput from '../general/SelectInput';
import Modal from '../ui/Modal';
import Checkbox from '../general/Checkbox';
import classes from './EditIngredient.module.css';

const EditIngredient = (props) => {
  const [categories, setCategories] = useState([]);
  const [allergenCategories, setAllergenCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const sortAllergens = (a, b) => {
    const textA = a.nomCatAllerg;
    const textB = b.nomCatAllerg;
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  };
  const sortIngredientCategories = (a, b) => {
    const textA = a.nomCatIng;
    const textB = b.nomCatIng;
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  };
  const sortUnits = (a, b) => {
    const textA = a.nomUnite;
    const textB = b.nomUnite;
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  };

  const fetchCategories = async () => {
    const response = await fetch(
      'https://projet-awi-4e549-default-rtdb.europe-west1.firebasedatabase.app/ingredientCategory.json'
    );
    const data = await response.json();
    const loadedCategories = [];
    for (const key in data) {
      loadedCategories.push({ nomCatIng: data[key] });
    }
    loadedCategories.sort(sortIngredientCategories);
    setCategories(loadedCategories);
  };

  const fetchAllergen = async () => {
    const response = await fetch(
      'https://projet-awi-4e549-default-rtdb.europe-west1.firebasedatabase.app/allergen.json'
    );
    const data = await response.json();
    const loadedAllergen = [];
    for (const key in data) {
      loadedAllergen.push({ nomCatAllerg: data[key] });
    }
    loadedAllergen.sort(sortAllergens);
    setAllergenCategories(loadedAllergen);
  };

  const fetchUnits = async () => {
    const response = await fetch(
      'https://projet-awi-4e549-default-rtdb.europe-west1.firebasedatabase.app/units.json'
    );
    const data = await response.json();
    const loadedUnits = [];
    for (const key in data) {
      loadedUnits.push({ nomUnite: data[key] });
    }
    loadedUnits.sort(sortUnits);
    setUnits(loadedUnits);
  };

  //fetching ingredient catagories, allergen categories and units
  useEffect(() => {
    fetchAllergen();
    fetchCategories();
    fetchUnits();
  }, []);

  const givenIngredient = props.ingredientInfo.ingredient;
  const [currentIngredient, setCurrentIngredient] = useState({
    id: givenIngredient.id,
    nomIng: givenIngredient.nomIng !== undefined ? givenIngredient.nomIng : '',
    prixUnitaire:
      givenIngredient.prixUnitaire !== undefined
        ? givenIngredient.prixUnitaire
        : 0,
    nomUnite:
      givenIngredient.nomUnite !== undefined
        ? givenIngredient.nomUnite
        : units[0].nomUnite,
    nomCatIng:
      givenIngredient.nomCatIng !== undefined
        ? givenIngredient.nomCatIng
        : categories[0].nomCatIng,
    nomCatAllerg: givenIngredient.nomCatAllerg,
  });

  // Allergene Checkbox
  const [isAllergen, setIsAllergen] = useState(
    currentIngredient.nomCatAllerg !== undefined
  );

  const checkboxHandler = (e) => {
    if (e.target.checked) {
      setIsAllergen(true);
      setCurrentIngredient({
        ...currentIngredient,

        nomCatAllerg: allergenCategories[0].nomCatAllerg,
      });
    } else {
      setIsAllergen(false);
      setCurrentIngredient({
        ...currentIngredient,

        nomCatAllerg: undefined,
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setCurrentIngredient({
      ...currentIngredient,

      [e.target.name]: value,
    });
  };

  const saveIngredient = (e) => {
    e.preventDefault();
    if (isValid()) {
      props.onClose();
      props.editIngredient(currentIngredient, props.ingredientInfo.index);
    }
  };

  // Validation

  const [nomIngEmptyError, setnomIngEmptyError] = useState(false);
  const [nomIngUnvailableError, setNomIngUnvailableError] = useState(false);
  const [prixUnitaireError, setPrixUnitaireError] = useState(false);
  const [unitEmptyError, setUnitEmptyError] = useState(false);
  const [categoryEmptyError, setCategoryEmptyError] = useState(false);

  const isValid = () => {
    setnomIngEmptyError(false);
    setNomIngUnvailableError(false);
    setPrixUnitaireError(false);

    let isValid = true;

    if (currentIngredient.nomIng === '') {
      setnomIngEmptyError(true);
      isValid = false;
    }
    if (
      props.ingredientList.some(
        (ingredient, index) =>
          ingredient.nomIng === currentIngredient.nomIng &&
          index !== props.ingredientInfo.index
      )
    ) {
      setNomIngUnvailableError(true);
      isValid = false;
    }
    if (currentIngredient.nomCatIng === undefined) {
      setCategoryEmptyError(true);
      isValid = false;
    }
    if (currentIngredient.nomUnite === undefined) {
      setUnitEmptyError(true);
      isValid = false;
    }

    if (
      !/^(?!0\d)\d+(\.\d+)?$/.test(currentIngredient.prixUnitaire.toString())
    ) {
      setPrixUnitaireError(true);
      isValid = false;
    }
    return isValid;
  };

  return (
    <Modal onClose={props.onClose}>
      <h1 className={classes.title}>Modification d'un ingrédient</h1>
      <form className={classes.form} method='post'>
        <div className='col-5'>
          <div className={`row ${classes.input}`}>
            <TextInput
              label='Nom'
              name='nomIng'
              value={currentIngredient.nomIng}
              onChange={handleChange}
            />
            {nomIngEmptyError && (
              <p className={classes.errorMessage}>
                Le nom ne peut pas être vide
              </p>
            )}
            {nomIngUnvailableError && (
              <p className={classes.errorMessage}>Ce nom existe déjà</p>
            )}
          </div>
          <div className={`row ${classes.input}`}>
            <NumberInput
              label='Prix'
              name='prixUnitaire'
              value={currentIngredient.prixUnitaire}
              onChange={handleChange}
            />
            {prixUnitaireError && (
              <p className={classes.errorMessage}>
                Le prix doit être un nombre
              </p>
            )}
          </div>
          <div className={`row ${classes.input}`}>
            <SelectInput
              label='Unité'
              name='nomUnite'
              selected={currentIngredient.nomUnite}
              dropDownList={units}
              optionIdentifier='nomUnite'
              onChange={handleChange}
            />
            {unitEmptyError && (
              <p className={classes.errorMessage}>Choisissez une unité</p>
            )}
          </div>
        </div>
        <div className='col-2' />
        <div className='col-5'>
          <div className={`row ${classes.input}`}>
            <SelectInput
              label='Catégorie'
              name='nomCatIng'
              selected={currentIngredient.nomCatIng}
              dropDownList={categories}
              optionIdentifier='nomCatIng'
              onChange={handleChange}
            />
            {categoryEmptyError && (
              <p className={classes.errorMessage}>Choisissez une catégorie</p>
            )}
          </div>
          <div className={`row ${classes.input}`}>
            <Checkbox
              label='Allergène'
              onChange={checkboxHandler}
              checked={isAllergen}
              className={classes.checkbox}
            />
          </div>
          <div className={`row ${classes.input}`}>
            {isAllergen && (
              <SelectInput
                label='Catégorie allergène'
                name='nomCatAllerg'
                selected={currentIngredient.nomCatAllerg}
                dropDownList={allergenCategories}
                optionIdentifier='nomCatAllerg'
                onChange={handleChange}
              />
            )}
          </div>
        </div>
      </form>
      <div className={`row ${classes.buttons}`}>
        <div className='col-4' />
        <div className={`col-2`}>
          <Button className='confirmButton' onClick={saveIngredient}>
            Modifier
          </Button>
        </div>
        <div className={`col-2`}>
          <Button className='cancelButton' onClick={props.onClose}>
            Annuler
          </Button>
        </div>
        <div className='col-4' />
      </div>
    </Modal>
  );
};

export default EditIngredient;
