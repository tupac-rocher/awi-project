import { useState, useEffect } from 'react';
import Button from '../general/Button';
import TextInput from '../general/TextInput';
import SelectInput from '../general/SelectInput';
import Modal from '../ui/Modal';
import Checkbox from '../general/Checkbox';
import classes from './EditIngredient.module.css';
import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

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

  const ingredientCategoriesCollectionRef = collection(
    db,
    'ingredientCategories'
  );
  const allergenCollectionRef = collection(db, 'allergens');
  const unitsCollectionRef = collection(db, 'units');

  const getCategories = async () => {
    const data = await getDocs(ingredientCategoriesCollectionRef);
    const loadedCategories = [];
    data.docs.map((doc) => {
      return loadedCategories.push({ nomCatIng: doc.data().nomCatIng });
    });
    loadedCategories.sort(sortIngredientCategories);
    setCategories(loadedCategories);
  };

  const getAllergen = async () => {
    const data = await getDocs(allergenCollectionRef);
    const loadedAllergens = [];
    data.docs.map((doc) => {
      return loadedAllergens.push({ nomCatAllerg: doc.data().nomCatAllerg });
    });
    loadedAllergens.sort(sortAllergens);
    setAllergenCategories(loadedAllergens);
  };

  const getUnits = async () => {
    const data = await getDocs(unitsCollectionRef);
    const loadedUnits = [];
    data.docs.map((doc) => {
      return loadedUnits.push({ nomUnite: doc.data().nomUnite });
    });
    loadedUnits.sort(sortUnits);
    setUnits(loadedUnits);
  };

  //fetching ingredient catagories, allergen categories and units
  useEffect(() => {
    getAllergen();
    getCategories();
    getUnits();
  }, []);

  const givenIngredient = props.ingredientInfo.ingredient;
  const [currentIngredient, setCurrentIngredient] = useState({
    id: givenIngredient.id,
    nomIng: givenIngredient.nomIng !== undefined ? givenIngredient.nomIng : '',
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
    currentIngredient.nomCatAllerg !== undefined &&
      currentIngredient.nomCatAllerg !== ''
  );

  const checkboxHandler = (e) => {
    if (e.target.checked) {
      setIsAllergen(true);
    } else {
      setIsAllergen(false);
      setCurrentIngredient({
        ...currentIngredient,
        nomCatAllerg: '',
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
  const [categoryEmptyError, setCategoryEmptyError] = useState(false);

  const isValid = () => {
    setnomIngEmptyError(false);
    setNomIngUnvailableError(false);

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
              className={classes.selectInput}
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
                selected={
                  currentIngredient.nomCatAllerg === undefined
                    ? 'false'
                    : currentIngredient.nomCatAllerg
                }
                dropDownList={allergenCategories}
                optionIdentifier='nomCatAllerg'
                onChange={handleChange}
                className={classes.selectInput}
              />
            )}
          </div>
        </div>
      </form>
      <div className={`${classes.buttons}`}>
        <Button className='confirmButton' onClick={saveIngredient}>
          Modifier
        </Button>
        <Button className='cancelButton' onClick={props.onClose}>
          Annuler
        </Button>
      </div>
    </Modal>
  );
};

export default EditIngredient;
